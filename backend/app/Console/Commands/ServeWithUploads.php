<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand;

class ServeWithUploads extends ServeCommand
{
    protected $signature = 'serve:uploads
                    {--host= : The host address to serve the application on}
                    {--port= : The port to serve the application on}
                    {--tries=10 : The max number of ports to attempt to serve from}
                    {--no-reload : Do not reload the development server on .env file changes}';

    protected $description = 'Serve the application with 5 MB images and 32 MB multipart requests';

    protected function serverCommand(): array
    {
        $command = parent::serverCommand();
        array_splice($command, 1, 0, ['-d', 'upload_max_filesize=5M', '-d', 'post_max_size=32M']);

        return $command;
    }
}
