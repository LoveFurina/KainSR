import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpServerModule } from './http-server/http-server.module';
import { DataModule } from './data/data.module';
import { GameServerModule } from './game-server/game-server.module';

@Module({
  imports: [HttpServerModule, DataModule, GameServerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
