import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { onGetAvatarDataCsReq, onGetAvatarDataCsReqNew, onGetBagCsReq, onGetBagCsReqNew, onGetCurLineupDataCsReq } from '.';

export async function onGetFriendListInfoCsReq(
    body: any,
    player: NetSession,
    dataModule: DataService | null = null
): Promise<void> {
    const proto: starrail.GetFriendListInfoScRsp = new starrail.GetFriendListInfoScRsp({
        retcode: 0,
        friendInfoList: []
    })

    const simpleFriend : starrail.FriendInfo = new starrail.FriendInfo({
        playerSimpleInfo: {
            nickname: "FireFly",
            level: 70,
            uid: 1314,
            assistSimpleInfoList: [{
                avatarId: 1310,
                level: 80,
                dressedSkinId: 0,
                pos: 0
            }],
            platform: starrail.PlatformType.PC,
            onlineStatus: starrail.FriendOnlineStatus.FRIEND_ONLINE_STATUS_ONLINE
        }
    })

    proto.friendInfoList.push(simpleFriend)
    console.log(proto.friendInfoList)
    const bufferData = starrail.GetFriendListInfoScRsp.encode(proto).finish()
    await player.send(CmdID.CmdGetFriendListInfoScRsp, bufferData);
}

async function DisplayMessage(
    body: starrail.SendMsgCsReq,
    player: NetSession,
    text: string
) {
    const proto: starrail.RevcMsgScNotify = new starrail.RevcMsgScNotify({
        GPCNECEDGOF: body.GPCNECEDGOF,
        messageType: body.messageType,
        messageText: text,
        chatType: body.chatType,
        formId: 1334,
        toId: 1314,
        extraId: body.extraId
    })
    
    const bufferData = starrail.RevcMsgScNotify.encode(proto).finish()
    await player.send(CmdID.CmdRevcMsgScNotify, bufferData);
}


export async function onSendMsgCsReq(
    body: starrail.SendMsgCsReq,
    player: NetSession,
    dataModule: DataService | null = null
): Promise<void> {

    if (body.messageText.startsWith("/update")) {
        await dataModule.updateDataJson()
        await onGetAvatarDataCsReqNew(new starrail.GetAvatarDataCsReq({isGetAll: false}), player, dataModule)
        await onGetBagCsReqNew({}, player, dataModule)
        await onGetCurLineupDataCsReq({}, player, dataModule)
        await onGetBagCsReq({}, player, dataModule)
        await onGetAvatarDataCsReq(new starrail.GetAvatarDataCsReq({isGetAll: true}), player, dataModule)
        const text = "Update freesr-data.json successfully!"
        await DisplayMessage(body, player, text)

    }
    else if (body.messageText.startsWith("/id")) {
        const data = body.messageText.split(' ')
        try {
            const idChar = parseInt(data[1])

            if (idChar <= 8400 && idChar >= 8000) {
                const text = "Update Path MC successfully!"
                await dataModule.getUpdateIdChar(idChar, player)
                await DisplayMessage(body, player, text)
            }
            else if (idChar == 1001 || idChar >= 1224) {
                const text ="Update Path M7 successfully!"
                await dataModule.getUpdateIdChar(idChar, player)
                await DisplayMessage(body, player, text)
            }
            else if (idChar == 1001 || idChar >= 1224) {
                const text = "This id is not valid!"
                await DisplayMessage(body, player, text)
            }
        }
        catch(e) {
            console.log(e)
        }
    }
    else if (body.messageText.startsWith("/help")) {
        const text = `/update to update new data from freesr-data.json\n/id + idChar ex: /id 8006 in-game to update new Path for this character`
        await DisplayMessage(body, player, text)
    }
    else {
        const text = "This id command valid!"
        await DisplayMessage(body, player, text)
    }

    const proto: starrail.SendMsgScRsp = new starrail.SendMsgScRsp({
        retcode: 0,
        endTime: Date.now(),
    })
    
    const bufferData = starrail.SendMsgScRsp.encode(proto).finish()
    await player.send(CmdID.CmdSendMsgScRsp, bufferData);
}