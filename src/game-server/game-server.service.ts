import { Injectable } from '@nestjs/common';
import { Socket } from 'net';
import { NetSession } from "./NetSession"
import { DataService } from 'src/data/data.service';

@Injectable()
export class GameServerService {
    private player :  NetSession;
    constructor(
        private dataService : DataService
    ) {}

    handleConnection(socket: Socket): void {
        this.player = new NetSession(socket, this.dataService);
        this.player.run().catch((err) => {
            console.error('Error handling session:', err);
        });
    }
}
