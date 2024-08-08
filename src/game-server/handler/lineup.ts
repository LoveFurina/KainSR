import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { DataInGame } from 'src/data/loadDataInGame';
import { AvatarJson, JsonData } from 'src/data/loadFreeData';

export async function onGetCurLineupDataCsReq (
    body: any, 
    player: NetSession,
    dataModule: DataService | null = null
){
    const dataInGame : DataInGame = dataModule.getDataInGame()
    const lineup : starrail.LineupInfo = AvatarJson.to_lineup_info(dataInGame.lineups)
    
    const proto : starrail.GetCurLineupDataScRsp = new starrail.GetCurLineupDataScRsp({
        retcode: 0,
        lineup: lineup
    })
    const bufferData = starrail.GetCurLineupDataScRsp.encode(proto).finish()
    await player.send(CmdID.CmdGetCurLineupDataScRsp, bufferData)
}
export async function onGetAllLineupDataCsReq(
    body: any, 
    player: NetSession,
    dataModule: DataService | null = null
) {
    const dataInGame : DataInGame = dataModule.getDataInGame()
    const lineup : starrail.LineupInfo = AvatarJson.to_lineup_info(dataInGame.lineups)
    const proto: starrail.GetAllLineupDataScRsp = new starrail.GetAllLineupDataScRsp({
        retcode: 0,
        curIndex: 0,
        lineupList: []
    });
    proto.lineupList.push(lineup)
    const bufferData = starrail.GetAllLineupDataScRsp.encode(proto).finish()

    await player.send(CmdID.CmdGetAllLineupDataScRsp, bufferData);
}
export async function onChangeLineupLeaderCsReq(
    body: starrail.ChangeLineupLeaderScRsp, 
    player: NetSession,
    dataModule: DataService | null = null
) {

    const proto: starrail.ChangeLineupLeaderScRsp = new starrail.ChangeLineupLeaderScRsp({
        retcode: 0,
        slot: body.slot
    });
    const bufferData = starrail.ChangeLineupLeaderScRsp.encode(proto).finish()

    await player.send(CmdID.CmdChangeLineupLeaderScRsp, bufferData);
}

async function refreshLineup(player: NetSession, dataInGame : DataInGame) {
    const lineup : starrail.LineupInfo = AvatarJson.to_lineup_info(dataInGame.lineups)
    const proto: starrail.SyncLineupNotify = new starrail.SyncLineupNotify({
        reasonList: [],
        lineup: lineup
    });
    const bufferData = starrail.SyncLineupNotify.encode(proto).finish()

    await player.send(CmdID.CmdSyncLineupNotify, bufferData);
}

export async function onReplaceLineupCsReq(
    body: starrail.ReplaceLineupCsReq, 
    player: NetSession,
    dataModule: DataService | null = null
) {
    const dataInGame : DataInGame = dataModule.getDataInGame()

    const lineups = dataInGame.lineups;
    for (const slot in lineups) {
        const slotIndex = parseInt(slot);
        if (body.replaceSlotList[slotIndex]) {
            lineups[slot] = body.replaceSlotList[slotIndex].id;
        } else {
            lineups[slot] = 0;
        }
    }

    await dataModule.saveDataLineUp(dataInGame.lineups)
    await refreshLineup(player, dataInGame);

    const proto2 : starrail.JoinLineupScRsp = new starrail.JoinLineupScRsp({})
    const bufferData2 = starrail.JoinLineupScRsp.encode(proto2).finish()
    await player.send(CmdID.CmdJoinLineupScRsp, bufferData2);
}