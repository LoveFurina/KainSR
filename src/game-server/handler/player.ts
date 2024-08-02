
import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import Long from "long";

export async function onPlayerHeartBeatCsReq(
    body: starrail.PlayerHeartBeatCsReq,
    player: NetSession,
    dataModule: any | null = null
): Promise<void> {

    const base64_string = "Q1MuVW5pdHlFbmdpbmUuR2FtZU9iamVjdC5GaW5kKCJVSVJvb3QvQWJvdmVEaWFsb2cvQmV0YUhpbnREaWFsb2coQ2xvbmUpIik6R2V0Q29tcG9uZW50SW5DaGlsZHJlbih0eXBlb2YoQ1MuUlBHLkNsaWVudC5Mb2NhbGl6ZWRUZXh0KSkudGV4dCA9ICI8Y29sb3I9IzAwRkZGRj48Yj5LYWluU1I8L2I+PC9jb2xvcj4iCkNTLlVuaXR5RW5naW5lLkdhbWVPYmplY3QuRmluZCgiVmVyc2lvblRleHQiKTpHZXRDb21wb25lbnRJbkNoaWxkcmVuKHR5cGVvZihDUy5SUEcuQ2xpZW50LkxvY2FsaXplZFRleHQpKS50ZXh0ID0gIjxjb2xvcj0jRkYxNDkzPjIuNC41WF9GaXJlZmx5IGFuZCBMaW5nc2hhIExvdmVyPC9jb2xvcj4i";
    const bytesDecode = new Uint8Array(Buffer.from(base64_string, 'base64'));
    const proto: starrail.PlayerHeartBeatScRsp = new starrail.PlayerHeartBeatScRsp({
        downloadData:{
            version: 51,
            time: new Long(new Date().getTime()),
            data: bytesDecode,
        },
        serverTimeMs: new Long(new Date().getTime()),
        retcode: 0,
        clientTimeMs: body.clientTimeMs,
    });
    
    const bufferData = starrail.PlayerHeartBeatScRsp.encode(proto).finish()

    await player.send(
        CmdID.CmdPlayerHeartBeatScRsp,
        bufferData
    );
}
export async function onGetBasicInfoCsReq(
    body: any,
    player: NetSession,
    dataModule: any | null = null
): Promise<void> {
    const proto: starrail.GetBasicInfoScRsp = new starrail.GetBasicInfoScRsp({
        curDay : 1,
        exchangeTimes : 0,
        retcode : 0,
        nextRecoverTime : 2281337,
        weekCocoonFinishedCount : 0
    });

    const bufferData = starrail.GetBasicInfoScRsp.encode(proto).finish()

    await player.send(CmdID.CmdGetBasicInfoScRsp, bufferData);
}