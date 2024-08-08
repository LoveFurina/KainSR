import { starrail } from "src/proto/starrail";
import { NetSession } from "../NetSession";
import { CmdID } from "src/proto/cmdId";
import { DataInGame, PositionJson } from "src/data/loadDataInGame";
import { DataService } from 'src/data/data.service';
import { GameResources, PropState } from "src/data/loadResources";
import { JsonData } from "src/data/loadFreeData";

async function loadScene(player: NetSession, dataModule: DataService, entry_id: number, teleport_id?: number[]) {
    const GAME_RESOURCES : GameResources = dataModule.getDataResource();

    const jsonData : DataInGame = dataModule.getDataInGame();
    const jsonFree : JsonData = dataModule.getDataJson()
    // Find the entrance
    const entrance = GAME_RESOURCES.map_entrance[entry_id];
    if (!entrance) {
        throw new Error("Map Entrance Not Found");
    }

    // Find the plane
    const plane = GAME_RESOURCES.maze_plane[entrance.PlaneID];
    if (!plane) {
        throw new Error("Map Plane Not Found");
    }

    // Find the group config
    const groupConfig = GAME_RESOURCES.level_group[`P${entrance.PlaneID}_F${entrance.FloorID}`];
    if (!groupConfig) {
        throw new Error("Group Config Not Found");
    }

    // Set initial position
    const position = { ...jsonData.position };
    if (teleport_id) {
        const teleport = groupConfig.teleports[teleport_id[0]];
        if (teleport) {
            const anchor = groupConfig.group_items[teleport.AnchorGroupID]?.anchors[teleport.AnchorID];
            if (anchor) {
                position.x = Math.floor(anchor.PosX * 1000);
                position.y = Math.floor(anchor.PosY * 1000);
                position.z = Math.floor(anchor.PosZ * 1000);
                position.rotY = Math.floor(anchor.RotY * 1000);
            }
        }
    }

    // Initialize scene info
    const sceneInfo: starrail.SceneInfo = new starrail.SceneInfo({
        gameModeType: 1,
        entryId: jsonData.scene.entry_id,
        planeId: jsonData.scene.plane_id,
        floorId: jsonData.scene.floor_id,
        sceneGroupList: [],
        JNCGAINGMMM : 1
    });

    // Load player entity
    const playerGroup: starrail.SceneGroupInfo = new starrail.SceneGroupInfo({
        state: 1,
        entityList: [new starrail.SceneEntityInfo({
            instId: 0,
            entityId: 1,
            motion: jsonData.position.to_motion(),
            actor: {
                avatarType: starrail.AvatarType.AVATAR_FORMAL_TYPE,
                baseAvatarId: jsonData.lineups[0],
                mapLayer: 2,
                uid: 1337
            }
        })]
    });

    sceneInfo.sceneGroupList.push(playerGroup);

    const loadedNpc: number[] = [];
    let propEntityId = 1000;
    // let npcEntityId = 20000;
    // let monsterEntityId = 30000;

    for (const [groupId, group] of Object.entries(groupConfig.group_items)) {
        const groupInfo: starrail.SceneGroupInfo = new starrail.SceneGroupInfo({
            state: 1,
            groupId: parseInt(groupId),
            entityList: []
        });

        if (parseInt(groupId) === 186) {
            const groupPosition: PositionJson = new PositionJson(
                jsonData.position.x + 10,
                jsonData.position.y,
                jsonData.position.z + 10,
                0
            );
            groupInfo.entityList.push(new starrail.SceneEntityInfo({
                instId: 300001,
                groupId: parseInt(groupId),
                entityId: 1337,
                prop: new starrail.ScenePropInfo({
                    propId: 808,
                    propState: 1
                }),
                motion: groupPosition.to_motion()
            }));
        }

        // Load Props
        for (const prop of group.props) {
            const propState = prop.propStateList.includes(PropState.CheckPointEnable) ? PropState.CheckPointEnable : prop.State;

            propEntityId += 1;

            if (propEntityId === 300001) {
                continue;
            }

            const propPosition: PositionJson = new PositionJson(
                Math.floor(prop.PosX * 1000),
                Math.floor(prop.PosY * 1000),
                Math.floor(prop.PosZ * 1000),
                Math.floor(prop.RotY * 1000)
            );

            const entityInfo: starrail.SceneEntityInfo = new starrail.SceneEntityInfo({
                instId: prop.ID,
                groupId: prop.groupId,
                motion: propPosition.to_motion(),
                prop: new starrail.ScenePropInfo({
                    propId: prop.PropID,
                    propState: propState
                }),
                entityId: propEntityId
            });

            groupInfo.entityList.push(entityInfo);
        }

        // Load NPCs
        // for (const npc of group.npcs) {
        //     if (loadedNpc.includes(npc.NPCID) || jsonFree.avatars[npc.NPCID]) {
        //         continue;
        //     }
        //     npcEntityId += 1;
        //     loadedNpc.push(npc.NPCID);

        //     const npcPosition : PositionJson = new PositionJson(
        //         Math.floor(npc.PosX * 1000),
        //         Math.floor(npc.PosY * 1000),
        //         Math.floor(npc.PosZ * 1000),
        //         Math.floor(npc.RotY * 1000)
        //     );

        //     const info: starrail.SceneEntityInfo = new starrail.SceneEntityInfo({
        //         instId: npc.ID,
        //         groupId: npc.group_id,
        //         entityId: npcEntityId,
        //         motion:npcPosition.to_motion(),
        //         npc: new starrail.SceneNpcInfo({
        //             npcId: npc.NPCID
        //         })
        //     });

        //     groupInfo.entityList.push(info);
        // }

        // Load Monsters
        // for (const monster of group.monsters) {
        //     monsterEntityId += 1;
        //     const monsterPosition : PositionJson = new PositionJson(
        //         Math.floor(monster.PosX * 1000),
        //         Math.floor(monster.PosY * 1000),
        //         Math.floor(monster.PosZ * 1000),
        //         Math.floor(monster.RotY * 1000)
        //     );

        //     const npcMonster: starrail.SceneNpcMonsterInfo = new starrail.SceneNpcMonsterInfo({
        //         monsterId: monster.NPCMonsterID,
        //         eventId: monster.EventID,
        //         worldLevel: 6
        //     });

        //     const info: starrail.SceneEntityInfo = new starrail.SceneEntityInfo({
        //         instId: monster.ID,
        //         groupId: monster.group_id,
        //         entityId: monsterEntityId,
        //         motion: monsterPosition.to_motion(),
        //         npcMonster: npcMonster
        //     });

        //     groupInfo.entityList.push(info);
        // }

        sceneInfo.sceneGroupList.push(groupInfo);
    }
    return sceneInfo;
}



export async function onGetCurSceneInfoCsReq(
    body: any,
    player: NetSession,
    dataModule: DataService | null = null
) {
    await dataModule.updateDataInGame()
    const playerData : DataInGame = dataModule.getDataInGame(); 
    const entry = playerData.scene.entry_id;

    let sceneInfo : starrail.SceneInfo = await loadScene(player, dataModule, entry, []);
    if (!sceneInfo){
        sceneInfo = new starrail.SceneInfo({
            gameModeType: 1,
            entryId: playerData.scene.entry_id,
            planeId: playerData.scene.plane_id,
            floorId: playerData.scene.floor_id
        })
    }

    const proto: starrail.GetCurSceneInfoScRsp = new starrail.GetCurSceneInfoScRsp({
        retcode: 0,
        scene: sceneInfo
    });
    const bufferData = starrail.GetCurSceneInfoScRsp.encode(proto).finish();
    await player.send(CmdID.CmdGetCurSceneInfoScRsp, bufferData);


    if (!playerData.position.isEmpty()) {
        const moveNotify = new starrail.SceneEntityMoveScNotify({
            entityId: 0,
            entryId: playerData.scene.entry_id,
            motion: {
                pos: {
                    x: playerData.position.x,
                    y: playerData.position.y,
                    z: playerData.position.z
                },
                rot: {
                    x: playerData.position.x || 0,
                    y: playerData.position.rotY || 0,
                    z: playerData.position.z || 0
                }
            }
        });

        const moveNotifyBuffer = starrail.SceneEntityMoveScNotify.encode(moveNotify).finish();
        await player.send(CmdID.CmdSceneEntityMoveScNotify, moveNotifyBuffer);
    }
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