import { Module } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import * as net from 'net';
import { DataModule } from 'src/data/data.module';

@Module({
  imports:[DataModule],
  providers: [
    GameServerService,
    {
      provide: 'TcpServerService',
      useFactory: (gameserverService: GameServerService) => {
        const server = net.createServer(socket => {
          gameserverService.handleConnection(socket);
          socket.on('error', err => console.error(`Socket error: ${err.message}`));
          socket.on('close', () => console.log('Connection closed'))
        });
        server.listen(23301, '127.0.0.1', () => {
          console.log('Server listening on port 23301');
        });
        return server;
      },
      inject: [GameServerService],
    },
  ]
})
export class GameServerModule {}
