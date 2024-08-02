import { starrail } from 'src/proto/starrail';
import Long from 'long';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';

export async function onPlayerGetTokenCsReq( 
    body: starrail.PlayerGetTokenCsReq | any, 
    player: NetSession,
    dataModule: any | null = null
) {

    const proto: starrail.PlayerGetTokenScRsp = new starrail.PlayerGetTokenScRsp({
        retcode: 0,
        msg: "OK",
        uid: 1334,
        secretKeySeed: 0
    });

    const bufferData = starrail.PlayerGetTokenScRsp.encode(proto).finish()

    await player.send(CmdID.CmdPlayerGetTokenScRsp, bufferData);
}

export async function onPlayerLoginCsReq(
    body: starrail.PlayerLoginCsReq | any,
    player: NetSession,
    dataModule: any | null = null
): Promise<void> {
    const proto: starrail.PlayerLoginScRsp = new starrail.PlayerLoginScRsp({
        retcode: 0,
        loginRandom: body.loginRandom,
        serverTimestampMs: new Long(new Date().getTime()),
        stamina: 240,
        basicInfo: {
            nickname: "KainSR",
            level: 70,
            worldLevel: 6,
            stamina: 100,
        },
      });
    const bufferData = starrail.PlayerLoginScRsp.encode(proto).finish()

    await player.send(CmdID.CmdPlayerLoginScRsp, bufferData);
}
