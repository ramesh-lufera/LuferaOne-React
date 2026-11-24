<?php

namespace Tests\Feature;

use App\Console\Commands\ServeWithUploads;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class PackageUploadConfigurationTest extends TestCase
{
    public function test_development_server_receives_effective_upload_limits_without_changing_global_php_settings(): void
    {
        $command = new class extends ServeWithUploads
        {
            public function processArguments(): array
            {
                $this->input = new ArrayInput(['--host' => '127.0.0.1', '--port' => '8000'], $this->getDefinition());

                return $this->serverCommand();
            }
        };
        $command->setLaravel($this->app);
        $arguments = $command->processArguments();
        $this->assertContains('upload_max_filesize=5M', $arguments);
        $this->assertContains('post_max_size=32M', $arguments);
        $this->assertContains('127.0.0.1:8000', $arguments);
        $serverIndex = array_search('-S', $arguments, true);
        $process = new Process([...array_slice($arguments, 0, $serverIndex), '-r', 'echo ini_get("upload_max_filesize")."|".ini_get("post_max_size");']);
        $process->mustRun();
        $this->assertSame('5M|32M', $process->getOutput());
    }
}
