<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class InvoiceNumberConcurrencyTest extends TestCase
{
    public function test_simultaneous_mysql_allocations_and_retries_are_unique(): void
    {
        if (getenv('INVOICE_MYSQL_CONCURRENCY') !== '1' || DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run explicitly against local MySQL after migrating. Uses isolated temporary table copies.');
        }
        $connection = DB::connection();
        $originalConnection = DB::getDefaultConnection();
        $prefix = 'invoice_concurrency_'.bin2hex(random_bytes(6)).'_';
        $configuration = $connection->getConfig();
        $configuration['prefix'] = $prefix;
        $configuration['name'] = 'invoice_concurrency';
        config(['database.connections.invoice_concurrency' => $configuration]);
        try {
            foreach (['invoice_settings', 'invoices'] as $table) {
                $connection->statement('CREATE TABLE `'.$prefix.$table.'` LIKE `'.$connection->getTablePrefix().$table.'`');
            }
            DB::setDefaultConnection('invoice_concurrency');
            DB::table('invoice_settings')->insert(['id' => 1, 'prefix' => 'INV-', 'suffix' => '-TEST', 'next_number' => 1, 'series_width' => 4, 'created_at' => now(), 'updated_at' => now()]);
            $payload = ['customer_name' => 'Concurrency Test', 'issued_on' => '2026-11-17', 'items' => [['description' => 'Test', 'quantity' => 1, 'unit_price' => '1.00']]];
            $jobs = [];
            for ($index = 0; $index < 6; $index++) {
                $jobs[] = [...$payload, 'request_id' => (string) Str::uuid()];
            }
            $numbers = $this->runWorkers($configuration, $jobs);
            sort($numbers);
            $this->assertSame(array_map(fn ($index) => 'INV-'.str_pad((string) $index, 4, '0', STR_PAD_LEFT).'-TEST', range(1, 6)), $numbers);
            $retry = [...$payload, 'request_id' => (string) Str::uuid()];
            $retries = $this->runWorkers($configuration, [$retry, $retry, $retry]);
            $this->assertSame(['INV-0007-TEST'], array_values(array_unique($retries)));
            $this->assertSame(7, DB::table('invoices')->count());
            $this->assertSame(8, (int) DB::table('invoice_settings')->value('next_number'));
        } finally {
            DB::purge('invoice_concurrency');
            DB::setDefaultConnection($originalConnection);
            $connection->statement('DROP TABLE IF EXISTS `'.$prefix.'invoices`');
            $connection->statement('DROP TABLE IF EXISTS `'.$prefix.'invoice_settings`');
        }
    }

    /** @return list<string> */
    private function runWorkers(array $configuration, array $jobs): array
    {
        $barrier = tempnam(sys_get_temp_dir(), 'invoice-barrier-');
        unlink($barrier);
        $workers = [];
        $code = <<<'WORKER'
require $argv[1].'/vendor/autoload.php';
$app = require $argv[1].'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
config(['database.connections.invoice_concurrency' => $input['configuration']]);
Illuminate\Support\Facades\DB::setDefaultConnection('invoice_concurrency');
Illuminate\Support\Facades\DB::beginTransaction();
Illuminate\Support\Facades\DB::table('invoices')->count();
echo "READY\n";
flush();
$deadline = time() + 20;
while (!is_file($input['barrier'])) {
    if (time() > $deadline) throw new RuntimeException('Concurrency barrier timed out.');
    usleep(1000);
}
$invoice = app(App\Services\InvoiceNumbering::class)->create($input['payload'], 1);
Illuminate\Support\Facades\DB::commit();
echo json_encode(['number' => $invoice->invoice_number], JSON_THROW_ON_ERROR);
WORKER;
        try {
            foreach ($jobs as $payload) {
                $process = new Process([PHP_BINARY, '-r', $code, base_path()], base_path());
                $process->setTimeout(30);
                $process->setInput(json_encode(['configuration' => $configuration, 'barrier' => $barrier, 'payload' => $payload], JSON_THROW_ON_ERROR));
                $process->start();
                $workers[] = $process;
            }
            $deadline = microtime(true) + 15;
            while (count(array_filter($workers, fn (Process $process) => str_contains($process->getOutput(), 'READY'))) !== count($workers)) {
                foreach ($workers as $process) {
                    $this->assertTrue($process->isRunning(), $process->getErrorOutput());
                }
                $this->assertLessThan($deadline, microtime(true), 'Workers did not reach the concurrency barrier.');
                usleep(20000);
            }
            touch($barrier);
            $numbers = [];
            foreach ($workers as $process) {
                $process->wait();
                $this->assertTrue($process->isSuccessful(), $process->getErrorOutput());
                $output = explode("\n", trim($process->getOutput()));
                $numbers[] = json_decode(end($output), true, flags: JSON_THROW_ON_ERROR)['number'];
            }

            return $numbers;
        } finally {
            foreach ($workers as $process) {
                if ($process->isRunning()) {
                    $process->stop(0.1);
                }
            }
            if (is_file($barrier)) {
                unlink($barrier);
            }
        }
    }
}
