import { starrail } from 'src/proto/starrail';
import { NetSession } from "../NetSession"
import { CmdID } from 'src/proto/cmdId';
import { DataService } from 'src/data/data.service';
import { GameConfig } from 'src/data/loadConfig';


export async function onStartCocoonStageCsReq(
    body: starrail.StartCocoonStageCsReq,
    session: NetSession,
    dataModule: DataService | null = null
) {
    const jsonData: GameConfig = dataModule.getDataInGame();
    const battle: starrail.SceneBattleInfo = new starrail.SceneBattleInfo();

    // Avatar handler
    for (let i = 0; i < jsonData.avatar_config.length; i++) {
        const tmpAvatar: starrail.BattleAvatar = new starrail.BattleAvatar();
        tmpAvatar.id = jsonData.avatar_config[i].id;
        tmpAvatar.hp = jsonData.avatar_config[i].hp * 100;
        tmpAvatar.sp = {
            spCur: jsonData.avatar_config[i].sp * 100,
            spNeed: 10000,
        };
        tmpAvatar.level = jsonData.avatar_config[i].level;
        tmpAvatar.rank = jsonData.avatar_config[i].rank;
        tmpAvatar.promotion = jsonData.avatar_config[i].promotion;
        tmpAvatar.avatarType = starrail.AvatarType.AVATAR_FORMAL_TYPE;

        // Relics
        for (let j = 0; j < jsonData.avatar_config[i].relics.length; j++) {
            const tmpRelic = relicCoder(
                jsonData.avatar_config[i].relics[j].id,
                jsonData.avatar_config[i].relics[j].level,
                jsonData.avatar_config[i].relics[j].main_affix_id,
                jsonData.avatar_config[i].relics[j].stat1,
                jsonData.avatar_config[i].relics[j].cnt1,
                jsonData.avatar_config[i].relics[j].stat2,
                jsonData.avatar_config[i].relics[j].cnt2,
                jsonData.avatar_config[i].relics[j].stat3,
                jsonData.avatar_config[i].relics[j].cnt3,
                jsonData.avatar_config[i].relics[j].stat4,
                jsonData.avatar_config[i].relics[j].cnt4
            );
            tmpAvatar.relicList.push(tmpRelic);
        }

        // Lightcone
        const lc = new starrail.BattleEquipment({
            id: jsonData.avatar_config[i].lightcone.id,
            rank: jsonData.avatar_config[i].lightcone.rank,
            level: jsonData.avatar_config[i].lightcone.level,
            promotion: jsonData.avatar_config[i].lightcone.promotion,
        });
        tmpAvatar.equipmentList.push(lc);

        // Skills
        const skills = [1, 2, 3, 4, 7, 101, 102, 103, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210];
        for (const elem of skills) {
            let talentLevel: number = 0;
            if (elem === 1) {
                talentLevel = 6;
            } else if (elem <= 4) {
                talentLevel = 10;
            } else {
                talentLevel = 1;
            }
            const talent = new starrail.AvatarSkillTree({
                pointId: tmpAvatar.id * 1000 + elem,
                level: talentLevel,
            });
            tmpAvatar.skilltreeList.push(talent);
        }

        // Buffs
        if (jsonData.avatar_config[i].use_technique) {
            const targetIndexList = [];
            targetIndexList.push(0);
            const buff = new starrail.BattleBuff({
                id: 121401,
                level: 1,
                ownerIndex: i,
                waveFlag: 1,
                targetIndexList: targetIndexList,
                dynamicValues: {},
            });
            buff.dynamicValues["SkillIndex"] = 0 ;
            battle.buffList.push(buff);
        }

        battle.battleAvatarList.push(tmpAvatar);
    }

    // Basic info
    battle.battleId = jsonData.battle_config.battle_id;
    battle.stageId = jsonData.battle_config.stage_id;
    battle.logicRandomSeed = Math.floor(Date.now() % 0xFFFFFFFF);
    battle.cycleCount = jsonData.battle_config.cycle_count;
    battle.monsterWaveLength = jsonData.battle_config.monster_wave.length;

    // Monster handler
    for (const wave of jsonData.battle_config.monster_wave) {
        const monsterWave = new starrail.SceneMonsterWave();
        monsterWave.monsterWaveParam = new starrail.SceneMonsterWaveParam({
            level: jsonData.battle_config.monster_level,
        });
        for (const mobId of wave) {
            monsterWave.monsterList.push({ monsterId: mobId });
        }
        battle.monsterWaveList.push(monsterWave);
    }

    // Stage blessings
    for (const blessing of jsonData.battle_config.blessings) {
        const targetIndexList = [];
        targetIndexList.push(0);
        const buff = new starrail.BattleBuff({
            id: blessing,
            level: 1,
            ownerIndex: 0xffffffff,
            waveFlag: 0xffffffff,
            targetIndexList: targetIndexList,
            dynamicValues: {},
        });
        buff.dynamicValues["SkillIndex"] =0;
        battle.buffList.push(buff);
    }

    // PF/AS scoring
  
    battle.battleTargetInfo = {};

    // Target hardcode
    const pfTargetHead = new starrail.BattleTargetList();
    pfTargetHead.KNBBHOJNOFF = [];
    pfTargetHead.KNBBHOJNOFF.push(new starrail.BattleTarget({ id: 10002, progress: 0, totalProgress: 0 }));

    const pfTargetTail = new starrail.BattleTargetList();
    pfTargetTail.KNBBHOJNOFF = [];
    pfTargetTail.KNBBHOJNOFF.push(new starrail.BattleTarget({ id: 2001, progress: 0, totalProgress: 0 }));
    pfTargetTail.KNBBHOJNOFF.push(new starrail.BattleTarget({ id: 2002, progress: 0, totalProgress: 0 }));

    const asTargetHead = new starrail.BattleTargetList();
    asTargetHead.KNBBHOJNOFF = [];
    asTargetHead.KNBBHOJNOFF.push(new starrail.BattleTarget({ id: 90005, progress: 0, totalProgress: 0 }));

    switch (battle.stageId) {
        // PF
        case 30019000:
        case 30019001:
        case 30019002:
        // Add more cases as needed
        case 30019100:
        case 30021000:
        // Add more cases as needed
        case 30021100:
        case 30301000:
        // Add more cases as needed
        case 30307000:
            battle.battleTargetInfo[1]=pfTargetHead;
            for (let i = 2; i <= 5; i++) {
                battle.battleTargetInfo[i] = new starrail.BattleTargetList();
            }
            battle.battleTargetInfo[5] = pfTargetTail ;
            break;

        // AS
        case 420100:
        case 420200:
            battle.battleTargetInfo[1] = asTargetHead ;
            break;
        default:
            break;
    }

    const startCocoonStageScRsp = new starrail.StartCocoonStageScRsp({
        retcode: 0,
        cocoonId: body.cocoonId,
        propEntityId: body.propEntityId,
        wave: body.wave,
        battleInfo: battle,
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

export function relicCoder(
    id: number,
    level: number,
    main_affix_id: number,
    stat1: number, 
    cnt1: number, 
    stat2: number, 
    cnt2: number, 
    stat3: number, 
    cnt3: number, 
    stat4: number, 
    cnt4: number
) : starrail.BattleRelic
{
    const relic : starrail.BattleRelic = new starrail.BattleRelic({
        id: id,
        mainAffixId: main_affix_id,
        level: level,
        subAffixList: []
    })
    relic.subAffixList.push(new starrail.RelicAffix({ affixId : stat1, cnt : cnt1, step : 3 }));
    relic.subAffixList.push(new starrail.RelicAffix({ affixId : stat2, cnt : cnt2, step : 3 }));
    relic.subAffixList.push(new starrail.RelicAffix({ affixId : stat3, cnt : cnt3, step : 3 }));
    relic.subAffixList.push(new starrail.RelicAffix({ affixId : stat4, cnt : cnt4, step : 3 }));
    return relic
}