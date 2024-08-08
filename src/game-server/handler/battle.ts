import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { JsonData, MonsterJson } from 'src/data/loadFreeData';
import { DataInGame } from 'src/data/loadDataInGame';



export async function onStartCocoonStageCsReq(
    body: starrail.StartCocoonStageCsReq,
    session: NetSession,
    dataModule: DataService | null = null
) {
    const jsonData: JsonData = dataModule.getDataJson();
    const dataInGame: DataInGame = dataModule.getDataInGame();
    const battleInfo: starrail.SceneBattleInfo = new starrail.SceneBattleInfo();

    // Initialize battleInfo
    battleInfo.stageId = jsonData.battle_config.stage_id;
    battleInfo.logicRandomSeed = Math.floor(Math.random() * 0xFFFFFFFF); // Simulating random seed
    battleInfo.battleId = 1;
    battleInfo.cycleCount = jsonData.battle_config.cycle_count; // wave

    // Process avatars
    for (let i = 0; i < 4; i++) {
        let avatarId = dataInGame.lineups[i] || 0;
        if (avatarId === 0) {
            continue;
        }
        const multiPathMain = [8001, 8002, 8003, 8004, 8005, 8006];
        if (multiPathMain.includes(avatarId)) {
            avatarId = dataModule.getIdMain()
        }
        const multiPathM7 = [1001, 1224,];
        if (multiPathM7.includes(avatarId)) {
            avatarId = dataModule.getIdM7()
        }
        const avatar = jsonData.avatars[avatarId.toString()];
        if (avatar) {
            const lightcone = jsonData.lightcones.find(lc => lc.equip_avatar === avatar.avatar_id);
            const relics = jsonData.relics.filter(r => r.equip_avatar === avatar.avatar_id);

            const [battleAvatar, techs] = avatar.to_battle_avatar_proto(
                i,
                lightcone,
                relics
            );

            techs.forEach(tech => battleInfo.buffList.push(tech));
            battleInfo.battleAvatarList.push(battleAvatar);
        }
    }

    // Custom stats for avatars
    for (const stat of jsonData.battle_config.custom_stats) {
        for (const avatar of battleInfo.battleAvatarList) {
            if (avatar.relicList.length === 0) {
                avatar.relicList.push(new starrail.BattleRelic({
                    id: 61011,
                    mainAffixId: 1,
                    level: 1
                }));
            }

            const subAffix = avatar.relicList[0].subAffixList.find(a => a.affixId === stat.sub_affix_id);
            if (subAffix) {
                subAffix.cnt = stat.count;
            } else {
                avatar.relicList[0].subAffixList.push(new starrail.RelicAffix({
                    affixId: stat.sub_affix_id,
                    cnt: stat.count,
                    step: stat.step
                }));
            }
        }
    }

    // Blessings
    for (const blessing of jsonData.battle_config.blessings) {
        const buffs = new starrail.BattleBuff({
            id: blessing.id,
            level: blessing.level,
            waveFlag: 0xffffffff,
            ownerIndex: 0xffffffff,
            dynamicValues: {} // Initialize as an empty object
        });

        if (blessing.dynamic_key) {
            buffs.dynamicValues[blessing.dynamic_key.key] = blessing.dynamic_key.value;
        }
        battleInfo.buffList.push(buffs);
    }

    // PF score object
    if (jsonData.battle_config.battle_type === 'PF') {
        const battleTargetList = new starrail.BattleTargetList({
            KNBBHOJNOFF: [new starrail.BattleTarget({ id: 10001, progress: 0 })]
        });

        battleInfo.battleTargetInfo[1] = battleTargetList;
        for (let i = 2; i <= 4; i++) {
            battleInfo.battleTargetInfo[i] = new starrail.BattleTargetList();
        }
        battleInfo.battleTargetInfo[5] = new starrail.BattleTargetList({
            KNBBHOJNOFF: [
                new starrail.BattleTarget({ id: 2001, progress: 0 }),
                new starrail.BattleTarget({ id: 2002, progress: 0 })
            ]
        });
    }

    // Apocalyptic Shadow
    if (jsonData.battle_config.battle_type === 'AS') {
        const battleTargetList = new starrail.BattleTargetList({
            KNBBHOJNOFF: [new starrail.BattleTarget({ id: 90005, progress: 0 })]
        });
        battleInfo.battleTargetInfo[1] = battleTargetList;
    }

    // SU
    if (jsonData.battle_config.battle_type === 'SU') {
        battleInfo.APKPBAMMNHM.push(new starrail.PLDMLJCICKK({
            GHHNOEFIBKE: jsonData.battle_config.path_resonance_id,
            status: new starrail.CHCJBNEICFA({
                sp: new starrail.SpProgress({
                    spCur: 10000,
                    spNeed: 10000
                })
            })
        }));
    }

    // Monsters
    battleInfo.monsterWaveList = MonsterJson.to_scene_monster_waves(jsonData.battle_config.monsters);

    const startCocoonStageScRsp = new starrail.StartCocoonStageScRsp({
        retcode: 0,
        cocoonId: body.cocoonId,
        propEntityId: body.propEntityId,
        wave: body.wave,
        battleInfo: battleInfo,
    });

    const bufferData = starrail.StartCocoonStageScRsp.encode(startCocoonStageScRsp).finish();

    await session.send(CmdID.CmdStartCocoonStageScRsp, bufferData);
}

export async function onPVEBattleResultCsReq(
    body: starrail.PVEBattleResultCsReq,
    player: NetSession,
    dataModule: DataService | null = null
): Promise<void> {
    const proto: starrail.PVEBattleResultScRsp = new starrail.PVEBattleResultScRsp({
        retcode: 0,
        endStatus: body.endStatus,
        battleId: body.battleId,
    })
    const bufferData = starrail.PVEBattleResultScRsp.encode(proto).finish()
    await player.send(CmdID.CmdPVEBattleResultScRsp, bufferData);
}

