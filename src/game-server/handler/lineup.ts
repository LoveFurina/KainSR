import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { GameConfig } from 'src/data/loadConfig';

export async function onGetCurLineupDataCsReq (
    body: any, 
    player: NetSession,
    dataModule: DataService | null = null
){
    const jsonData : GameConfig = dataModule.getDataInGame()
    const lineup : starrail.LineupInfo = new starrail.LineupInfo()
    lineup.HPMGGECENEM = 5;
    lineup.HGBHBGMMOKG = 5;
    lineup.KCLNAIMOFDL = 0;
    lineup.extraLineupType = starrail.ExtraLineupType.LINEUP_NONE
    lineup.name = "KainSR";
    lineup.avatarList= []

    for (let i = 0; i < jsonData.avatar_config.length; i++) {
        const tmpAvatar : starrail.LineupAvatar = new starrail.LineupAvatar();
        switch (jsonData.avatar_config[i].id) {
            case 8001:
            case 8002:
            case 8003:
            case 8004:
            case 8005:
            case 8006:
                tmpAvatar.id = 8006; // choose your main
                break;
            default:
                tmpAvatar.id = jsonData.avatar_config[i].id;
        }
        tmpAvatar.slot = i;
        tmpAvatar.satiety = 100;
        tmpAvatar.hp = jsonData.avatar_config[i].hp * 100;
        tmpAvatar.sp = {
            spCur: jsonData.avatar_config[i].sp * 100,
            spNeed: 10000
        }
        tmpAvatar.avatarType = starrail.AvatarType.AVATAR_FORMAL_TYPE;
        lineup.avatarList.push(tmpAvatar)
    }
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
    const jsonData : GameConfig = dataModule.getDataInGame()
    const lineup : starrail.LineupInfo = new starrail.LineupInfo()
    lineup.HPMGGECENEM = 5;
    lineup.HGBHBGMMOKG = 5;
    lineup.KCLNAIMOFDL = 0;
    lineup.extraLineupType = starrail.ExtraLineupType.LINEUP_NONE
    lineup.name = "KainSR";
    lineup.avatarList= []

    for (let i = 0; i < jsonData.avatar_config.length; i++) {
        const tmpAvatar : starrail.LineupAvatar = new starrail.LineupAvatar();
        switch (jsonData.avatar_config[i].id) {
            case 8001:
            case 8002:
            case 8003:
            case 8004:
            case 8005:
            case 8006:
                tmpAvatar.id = 8006; // choose your main
                break;
            default:
                tmpAvatar.id = jsonData.avatar_config[i].id;
        }
        tmpAvatar.slot = i;
        tmpAvatar.satiety = 100;
        tmpAvatar.hp = jsonData.avatar_config[i].hp * 100;
        tmpAvatar.sp = {
            spCur: jsonData.avatar_config[i].sp * 100,
            spNeed: 10000
        }
        tmpAvatar.avatarType = starrail.AvatarType.AVATAR_FORMAL_TYPE;
        lineup.avatarList.push(tmpAvatar)
    }
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

export async function onReplaceLineupCsReq(
    body: starrail.ReplaceLineupCsReq, 
    player: NetSession,
    dataModule: DataService | null = null
) {
    const lineup : starrail.LineupInfo = new starrail.LineupInfo()
    lineup.HPMGGECENEM = 5;
    lineup.HGBHBGMMOKG = 5;
    lineup.KCLNAIMOFDL = 0;
    lineup.extraLineupType = starrail.ExtraLineupType.LINEUP_NONE;
    lineup.name = "Squad 1";
    lineup.avatarList= []
    for (let i = 0; i < body.IPHNMDOIFON.length; i++) {
        const tmpAvatar : starrail.LineupAvatar = new starrail.LineupAvatar();
        tmpAvatar.id = body.IPHNMDOIFON[i].id;
        tmpAvatar.slot = body.IPHNMDOIFON[i].slot;
        tmpAvatar.satiety = 100;
        tmpAvatar.hp = 10000;
        tmpAvatar.sp = {
            spCur: 10000,
            spNeed: 10000
        }
        tmpAvatar.avatarType = starrail.AvatarType.AVATAR_FORMAL_TYPE;
        lineup.avatarList.push(tmpAvatar)
    }
    const proto1 : starrail.SyncLineupNotify = new starrail.SyncLineupNotify()
    proto1.lineup = lineup;
    const bufferData1 = starrail.SyncLineupNotify.encode(proto1).finish()
    await player.send(CmdID.CmdSyncLineupNotify, bufferData1);

    const proto2 : starrail.DLDNGOALCDB = new starrail.DLDNGOALCDB({
        retcode: 0
    })
    const bufferData2 = starrail.DLDNGOALCDB.encode(proto2).finish()
    await player.send(CmdID.CmdReplaceLineupScRsp, bufferData2);
}