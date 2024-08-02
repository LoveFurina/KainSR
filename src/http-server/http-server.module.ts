import { Module } from '@nestjs/common';
import { HttpServerService } from './http-server.service';
import { HttpServerController } from './http-server.controller';
import { DataModule } from 'src/data/data.module';

@Module({
  imports: [DataModule],
  providers: [HttpServerService],
  controllers: [HttpServerController]
})
export class HttpServerModule {}
