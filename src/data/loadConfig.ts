import * as path from 'path';
import * as fs from 'fs-extra';

export type Lightcone = {
    id: number;
    rank: number;
    level: number;
    promotion: number;
}

export type StatCount = {
    stat: number;
    count: number;
}

export type Relic =  {
    id: number;
    level: number;
    main_affix_id: number;
    sub_count: number;
    stat1: number;
    cnt1: number;
    stat2: number;
    cnt2: number;
    stat3: number;
    cnt3: number;
    stat4: number;
    cnt4: number;
}

export type Avatar = {
    id: number;
    hp: number;
    sp: number;
    level: number;
    promotion: number;
    rank: number;
    lightcone: Lightcone;
    relics: Relic[];
    use_technique: boolean;
}

export type BattleConfig = {
    battle_id: number;
    stage_id: number;
    cycle_count: number;
    monster_wave: number[][];
    monster_level: number;
    blessings: number[];
}

export type GameConfig = {
    battle_config: BattleConfig;
    avatar_config: Avatar[];
}

function parseStatCount(token: string): StatCount | null {
    const parts = token.split(':');
    if (parts.length !== 2) {
        console.error(`Invalid format for stat count: ${token}`);
        return null;
    }
    const stat = parseInt(parts[0], 10);
    const count = parseInt(parts[1], 10);
    if (isNaN(stat) || isNaN(count)) {
        console.error(`Invalid numbers in stat count: ${token}`);
        return null;
    }
    return { stat, count };
}

function parseRelic(relicStr: string): Relic | null {
    const tokens = relicStr.split(',');
    if (tokens.length < 8) {
        console.error(`Relic parsing error: ${relicStr}`);
        return null;
    }

    const stat1 = parseStatCount(tokens[4]);
    const stat2 = parseStatCount(tokens[5]);
    const stat3 = parseStatCount(tokens[6]);
    const stat4 = parseStatCount(tokens[7]);

    if (!stat1 || !stat2 || !stat3 || !stat4) {
        return null;
    }

    return {
        id: parseInt(tokens[0], 10),
        level: parseInt(tokens[1], 10),
        main_affix_id: parseInt(tokens[2], 10),
        sub_count: parseInt(tokens[3], 10),
        stat1: stat1.stat,
        cnt1: stat1.count,
        stat2: stat2.stat,
        cnt2: stat2.count,
        stat3: stat3.stat,
        cnt3: stat3.count,
        stat4: stat4.stat,
        cnt4: stat4.count,
    };
}

export async function readConfig(filePath: string): Promise<GameConfig> {
    const fileContent = await fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    const avatarConfig: Avatar[] = jsonData.avatar_config.map((avatar: any) => {
        const relics = avatar.relics.map((relicStr: string) => parseRelic(relicStr)).filter((relic: Relic | null) => relic !== null) as Relic[];
        return {
            id: avatar.id,
            hp: avatar.hp,
            sp: avatar.sp,
            level: avatar.level,
            promotion: avatar.promotion,
            rank: avatar.rank,
            lightcone: avatar.lightcone,
            relics: relics,
            use_technique: avatar.use_technique,
        };
    });

    const battleConfig: BattleConfig = jsonData.battle_config;

    return {
        battle_config: battleConfig,
        avatar_config: avatarConfig,
    };
}


