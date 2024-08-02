import { starrail } from "src/proto/starrail";
import { NetSession } from "../NetSession";
import { CmdID } from "src/proto/cmdId";

export async function onGetCurSceneInfoCsReq(
    body: any,
    player: NetSession,
    dataModule: any | null = null
) {
    const scene_info: starrail.SceneInfo = new starrail.SceneInfo()
    scene_info.gameModeType = 1;
    scene_info.planeId = 20313;
    scene_info.floorId = 20313001;
    scene_info.entryId = 2031301;
    // scene_info.JNCGAINGMMM = 1;

    { // Character
        const scene_group: starrail.SceneGroupInfo = new starrail.SceneGroupInfo()
        scene_group.state = 1;
        scene_group.entityList.push(new starrail.SceneEntityInfo({
            actor: {
                baseAvatarId: 1221,
                avatarType: starrail.AvatarType.AVATAR_FORMAL_TYPE,
                uid: 1337,
                mapLayer: 2
            },
            motion: {
                pos: {
                    x: 32342,
                    y: 192820,
                    z: 434276
                },
                rot: {}
            }
        }))
        scene_info.sceneGroupList.push(scene_group)
    }

    { // Calyx prop
        const scene_group: starrail.SceneGroupInfo = new starrail.SceneGroupInfo()
        scene_group.state = 1;
        scene_group.groupId = 186;

        const prop: starrail.ScenePropInfo = new starrail.ScenePropInfo();
        prop.propId = 808;
        prop.propState = 1;

        scene_group.entityList.push(new starrail.SceneEntityInfo({
            groupId: 186,
            instId: 300001,
            entityId: 186,
            prop: prop,
            motion: {
                pos: {
                    x: 31440,
                    y: 192820,
                    z: 433790
                },
                rot: {
                }
            }
        }))

        scene_info.sceneGroupList.push(scene_group)
    }
    const proto: starrail.GetCurSceneInfoScRsp = new starrail.GetCurSceneInfoScRsp({
        retcode: 0,
        scene: scene_info
    })
    const bufferData = starrail.GetCurSceneInfoScRsp.encode(proto).finish()
    await player.send(CmdID.CmdGetCurSceneInfoScRsp, bufferData);
}


export async function onSceneEntityMoveCsReq(
    body: starrail.SceneEntityMoveCsReq | any,
    player: NetSession,
    dataModule: any | null = null
) {
    // for (let i = 0; i < body.entityMotionList.length; i++) {
    //     if (body.entityMotionList[i].motion) {
    //         console.log(`
    //             [POSITION] entity_id: ${body.entityMotionList[i].entityId}, 
    //             posX: ${body.entityMotionList[i].motion.pos.x}, 
    //             posY: ${body.entityMotionList[i].motion.pos.y}, 
    //             posZ: ${body.entityMotionList[i].motion.pos.z}, 
    //             rotX: ${body.entityMotionList[i].motion.rot.x},
    //             rotY: ${body.entityMotionList[i].motion.rot.x},
    //             rotZ: ${body.entityMotionList[i].motion.rot.x},
    //             `
    //         )
    //     }
    // }  
    const proto: starrail.SceneEntityMoveScRsp = new starrail.SceneEntityMoveScRsp({
        retcode: 0,
        entityMotionList: body.entityMotionList,
        downloadData: null
    })
    const bufferData = starrail.SceneEntityMoveScRsp.encode(proto).finish()
    await player.send(CmdID.CmdSceneEntityMoveScRsp, bufferData)
}