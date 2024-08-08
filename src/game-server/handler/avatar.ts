
import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { UidGenerator } from './inventory';
import { DataService } from 'src/data/data.service';
import { JsonData } from 'src/data/loadFreeData';

const UNLOCKED_AVATARS: number[] = [
    8001, 8002, 8003, 8004, 8005, 8006, 1001, 1002, 1003, 1004, 1005, 1006, 1008, 1009, 1013, 1101,
    1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1201, 1202, 1203, 1204, 1205,
    1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215, 1217, 1301, 1302, 1303, 1304, 1305,
    1306, 1307, 1308, 1309, 1312, 1315, 1310, 1314, 1315, 1221, 1218, 1220, 1222, 1223, 1224
];

export async function onGetAvatarDataCsReq(
    body: starrail.GetAvatarDataCsReq,
    player: NetSession,
    dataModule: DataService | null = null
) {
    await dataModule.updateDataJson();
    const jsonData: JsonData = dataModule.getDataJson();

    const avatarList: starrail.Avatar[] = await Promise.all(UNLOCKED_AVATARS.map(async (id) => {
        const avatarJson = jsonData.avatars[id];
        if (avatarJson) {
            const lightcone = jsonData.lightcones.find(lc => lc.equip_avatar === id);
            const relics = jsonData.relics.filter(r => r.equip_avatar === id);
            const multiPath = [1001, 1224, 8001, 8002, 8003, 8004, 8005, 8006];
            if (multiPath.includes(id)) {
                let avatarType: starrail.MultiPathAvatarType = starrail.MultiPathAvatarType.MultiPathAvatarTypeNone;
                switch (id) {
                    case 8001:
                        avatarType = starrail.MultiPathAvatarType.BoyWarriorType;
                        break;
                    case 8002:
                        avatarType = starrail.MultiPathAvatarType.GirlWarriorType;
                        break;
                    case 8003:
                        avatarType = starrail.MultiPathAvatarType.BoyKnightType;
                        break;
                    case 8004:
                        avatarType = starrail.MultiPathAvatarType.GirlKnightType;
                        break;
                    case 8005:
                        avatarType = starrail.MultiPathAvatarType.BoyShamanType;
                        break;
                    case 8006:
                        avatarType = starrail.MultiPathAvatarType.GirlShamanType;
                        break;
                    case 1224:
                        avatarType = starrail.MultiPathAvatarType.Mar_7thRogueType;
                        break;
                    case 1001:
                        avatarType = starrail.MultiPathAvatarType.Mar_7thKnightType;
                        break;
                    default:
                        avatarType = starrail.MultiPathAvatarType.MultiPathAvatarTypeNone;
                        break;
                }

                const proto1 = new starrail.SetAvatarPathScRsp({
                    retcode: 0,
                    avatarId: avatarType
                });
                const bufferData1 = starrail.SetAvatarPathScRsp.encode(proto1).finish();
                await player.send(CmdID.CmdSetAvatarPathScRsp, bufferData1);
            }
            return avatarJson.to_avatar_proto(lightcone, relics);
        } else {
            return new starrail.Avatar({
                baseAvatarId: id,
                level: 80,
                promotion: 6,
                rank: 6,
                hasTakenRewardLevelList: Array.from({ length: 5 }, (_, index) => index + 1)
            });
        }
    }));

    const proto = new starrail.GetAvatarDataScRsp({
        retcode: 0,
        isAll: body.isGetAll,
        avatarList: avatarList
    });

    const bufferData = starrail.GetAvatarDataScRsp.encode(proto).finish();
    await player.send(CmdID.CmdGetAvatarDataScRsp, bufferData);
}


export async function onGetAvatarDataCsReqNew(
    body: starrail.GetAvatarDataCsReq,
    player: NetSession,
    dataModule: any | null = null
) {
    const genId: UidGenerator = new UidGenerator();
    const avatar_list: starrail.Avatar[] = [];

    // Add unlocked avatars
    for (let i = 0; i < UNLOCKED_AVATARS.length; i++) {
        const avatar = new starrail.Avatar({
            baseAvatarId: UNLOCKED_AVATARS[i],
            level: 80,
            promotion: 6,
            rank: 6,
            hasTakenRewardLevelList: Array.from({ length: 5 }, (_, index) => index + 1)
        });
        avatar_list.push(avatar);
    }
    // Create response
    const proto = new starrail.GetAvatarDataScRsp({
        retcode: 0,
        isAll: true,
        avatarList: avatar_list
    });

    // Encode and send response
    const bufferData = starrail.GetAvatarDataScRsp.encode(proto).finish();
    await player.send(CmdID.CmdGetAvatarDataScRsp, bufferData);
}

export async function onGetMultiPathAvatarInfoCsReq(
    body: any,
    player: NetSession,
    dataModule: any | null = null
) {
    const proto: starrail.GetMultiPathAvatarInfoScRsp = new starrail.GetMultiPathAvatarInfoScRsp({
        retcode: 0,
        curMultiPathAvatarTypeMap: {
            1001: starrail.MultiPathAvatarType.Mar_7thRogueType,
            80001: starrail.MultiPathAvatarType.GirlShamanType
        }
    })
    const bufferData = starrail.GetMultiPathAvatarInfoScRsp.encode(proto).finish()
    await player.send(CmdID.CmdGetMultiPathAvatarInfoScRsp, bufferData);
}


