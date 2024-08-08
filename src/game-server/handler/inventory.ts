import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { JsonData } from 'src/data/loadFreeData';

export async function onGetBagCsReq (
    body: any, 
    player: NetSession,
    dataModule: DataService | null = null
){

    const jsonData: JsonData = dataModule.getDataJson();

    const equipmentList = jsonData.lightcones || []; 
    const relicList = jsonData.relics || [];

    const proto = new starrail.GetBagScRsp({
        equipmentList: equipmentList.map(equipment => equipment.to_equipment_proto()),
        relicList: relicList.map(relic => relic.to_relic_proto()),
    });
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