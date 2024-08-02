import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { GameConfig } from 'src/data/loadConfig';

export async function onGetBagCsReq (
    body: any, 
    player: NetSession,
    dataModule: DataService | null = null
){
    const genId: UidGenerator = new UidGenerator();
    const proto : starrail.GetBagScRsp = new starrail.GetBagScRsp({
        equipmentList: [],
        relicList: []
    });

    const jsonData: GameConfig = dataModule.getDataInGame();
    for (const avatarConf of jsonData.avatar_config) {
        const lightcone = new starrail.Equipment({
            uniqueId: genId.nextId(),
            id: avatarConf.lightcone.id,
            isProtected: true,
            level: avatarConf.lightcone.level,
            rank: avatarConf.lightcone.rank,
            promotion: avatarConf.lightcone.promotion,
            charId: avatarConf.id
        })

        proto.equipmentList.push(lightcone)

        for (const relic of avatarConf.relics) {
            const tmpRelic : starrail.Relic= new starrail.Relic({
                id : relic.id, // tid
                mainAffixId : relic.main_affix_id,
                uniqueId : genId.nextId(),
                exp : 0,
                charId : avatarConf.id, // base avatar id
                MIDLNAIGNCG : true, // lock
                level : relic.level,
                subAffixList: []
            });
            tmpRelic.subAffixList.push(new starrail.RelicAffix({ affixId : relic.stat1, cnt : relic.cnt1, step : 3 }));
            tmpRelic.subAffixList.push(new starrail.RelicAffix({ affixId : relic.stat2, cnt : relic.cnt2, step : 3 }));
            tmpRelic.subAffixList.push(new starrail.RelicAffix({ affixId : relic.stat3, cnt : relic.cnt3, step : 3 }));
            tmpRelic.subAffixList.push(new starrail.RelicAffix({ affixId : relic.stat4, cnt : relic.cnt4, step : 3 }));
            proto.relicList.push(tmpRelic)
        }
    }
    const bufferData = starrail.GetBagScRsp.encode(proto).finish()
    await player.send(CmdID.CmdGetBagScRsp, bufferData);
}


export async function onGetBagCsReqNew (
    body: any, 
    player: NetSession,
    dataModule: DataService | null = null
){
    const proto : starrail.GetBagScRsp = new starrail.GetBagScRsp({
        equipmentList: [],
        relicList: []
    });
    const bufferData = starrail.GetBagScRsp.encode(proto).finish()
    await player.send(CmdID.CmdGetBagScRsp, bufferData);
}

export class UidGenerator {
    private currentId: number;

    constructor() {
        this.currentId = 0;
    }

    public nextId(): number {
        this.currentId = (this.currentId + 1) >>> 0; 
        return this.currentId;
    }
}