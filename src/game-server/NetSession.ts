import { Socket } from "net";
import { NetPacket } from "./NetPacket";
import { CmdID } from "src/proto/cmdId";
import {
    onPlayerGetTokenCsReq,
    onPlayerLoginCsReq,
    onPlayerHeartBeatCsReq,
    onGetAvatarDataCsReq,
    onGetMultiPathAvatarInfoCsReq,
    onGetMissionStatusCsReq,
    onGetCurSceneInfoCsReq,
    onSceneEntityMoveCsReq,
    onGetCurLineupDataCsReq,
    onPVEBattleResultCsReq,
    onStartCocoonStageCsReq,
    onChangeLineupLeaderCsReq,
    onReplaceLineupCsReq,
    onGetBagCsReq,
    onGetFriendListInfoCsReq,
    onSendMsgCsReq,
    onGetBasicInfoCsReq,
    onGetTutorialGuideCsReq,
    onGetTutorialCsReq,
    onGetAllLineupDataCsReq
} from "./handler"
import { starrail } from "src/proto/starrail";
import { DataService } from "src/data/data.service";

type HandlerFunction = (
    body: any,
    player: NetSession,
    dataModule: any | null
) => Promise<void>;

type CommandPair = {
    req: number;
    rsp: number;
};

type HandlerPair = {
    cmdID: number;
    action: HandlerFunction;
};

export class NetSession {
    private socketClient: Socket;
    private dataService: DataService;
    private HandlerList: HandlerPair[];
    private TypeList = {
        [CmdID.CmdPlayerGetTokenCsReq]: starrail.PlayerGetTokenCsReq,
        [CmdID.CmdPlayerLoginCsReq]: starrail.PlayerLoginCsReq,
        [CmdID.CmdPlayerHeartBeatCsReq]: starrail.PlayerHeartBeatCsReq,
        [CmdID.CmdGetAvatarDataCsReq]: starrail.GetAvatarDataCsReq,
        [CmdID.CmdGetMissionStatusCsReq]: starrail.GetMissionStatusCsReq,
        [CmdID.CmdSceneEntityMoveCsReq]: starrail.SceneEntityMoveCsReq,
        [CmdID.CmdPVEBattleResultCsReq]: starrail.PVEBattleResultCsReq,
        [CmdID.CmdStartCocoonStageCsReq]: starrail.StartCocoonStageCsReq,
        [CmdID.CmdReplaceLineupCsReq]: starrail.ReplaceLineupCsReq,
        [CmdID.CmdChangeLineupLeaderScRsp]: starrail.ChangeLineupLeaderScRsp,
        [CmdID.CmdSendMsgCsReq]: starrail.SendMsgCsReq
    }
    constructor(socketClient: Socket, dataService: DataService) {
        this.dataService = dataService;
        this.socketClient = socketClient;
        this.HandlerList = [
            { cmdID: CmdID.CmdPlayerGetTokenCsReq, action: onPlayerGetTokenCsReq },
            { cmdID: CmdID.CmdPlayerLoginCsReq, action: onPlayerLoginCsReq },
            { cmdID: CmdID.CmdPlayerHeartBeatCsReq, action: onPlayerHeartBeatCsReq },
            { cmdID: CmdID.CmdGetAvatarDataCsReq, action: onGetAvatarDataCsReq },
            { cmdID: CmdID.CmdGetMultiPathAvatarInfoCsReq, action: onGetMultiPathAvatarInfoCsReq },
            { cmdID: CmdID.CmdGetMissionStatusCsReq, action: onGetMissionStatusCsReq },
            { cmdID: CmdID.CmdGetCurLineupDataCsReq, action: onGetCurLineupDataCsReq },
            { cmdID: CmdID.CmdGetCurSceneInfoCsReq, action: onGetCurSceneInfoCsReq },
            { cmdID: CmdID.CmdSceneEntityMoveCsReq, action: onSceneEntityMoveCsReq },
            { cmdID: CmdID.CmdStartCocoonStageCsReq, action: onStartCocoonStageCsReq },
            { cmdID: CmdID.CmdPVEBattleResultCsReq, action: onPVEBattleResultCsReq },
            { cmdID: CmdID.CmdChangeLineupLeaderCsReq, action: onChangeLineupLeaderCsReq },
            { cmdID: CmdID.CmdReplaceLineupCsReq, action: onReplaceLineupCsReq },
            { cmdID: CmdID.CmdGetBagCsReq, action: onGetBagCsReq },
            { cmdID: CmdID.CmdGetFriendListInfoCsReq, action: onGetFriendListInfoCsReq },
            { cmdID: CmdID.CmdSendMsgCsReq, action: onSendMsgCsReq },
            { cmdID: CmdID.CmdGetBasicInfoCsReq, action: onGetBasicInfoCsReq },
            { cmdID: CmdID.CmdGetTutorialGuideCsReq, action: onGetTutorialGuideCsReq },
            { cmdID: CmdID.CmdGetTutorialCsReq, action: onGetTutorialCsReq },
            { cmdID: CmdID.CmdGetAllLineupDataCsReq, action: onGetAllLineupDataCsReq },
          ];
    }

    public async run() {
        console.log("Player connected to server")
        while (true) {
            const netPacket = await NetPacket.read(this.socketClient);
            if (!netPacket) {
                console.log('Received incomplete data from socket');
                continue;
            }
            await this.onMessage(netPacket.cmdId, netPacket.body);
        }
    }

    private async onMessage(cmd_type: number, payload: Uint8Array): Promise<void> {
        const handlerFind = this.HandlerList.find(handler => handler.cmdID == cmd_type);
        if (handlerFind) {
            const commandType = this.TypeList[cmd_type];
            if (commandType) {
                console.log(`Valid command found: ${cmd_type}`);
                const dataReq = commandType.decode(payload);
                await handlerFind.action(dataReq, this, this.dataService);
            } 
            else {
                console.warn(`Unknown command type: ${cmd_type}`);
                await handlerFind.action({}, this, this.dataService);
            }
        }
        else {
            const cmdKey = Object.keys(CmdID).find(key => CmdID[key] === cmd_type)
            if (cmdKey) {
                const responseKey = cmdKey.replace('CsReq', 'ScRsp');
                if (CmdID.hasOwnProperty(responseKey)) {
                    const responseCmdID = CmdID[responseKey];
                    console.log(`Dummy command found: ${cmd_type} -> ${responseCmdID}`);
                    await this.send_empty(responseCmdID);
                }

            }
        }
    }

    async send(cmd_type: number, body: Uint8Array): Promise<void> {
        const netPacket: NetPacket = new NetPacket(cmd_type, new Uint8Array, body)
        const payloadBuffer = netPacket.build();
        this.socketClient.write(payloadBuffer);
    }

    async send_empty(cmd_type: number): Promise<void> {
        const netPacket: NetPacket = new NetPacket(cmd_type, new Uint8Array, new Uint8Array)
        const payloadBuffer = netPacket.build();
        this.socketClient.write(payloadBuffer)
    }
}