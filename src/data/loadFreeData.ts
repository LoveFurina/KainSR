import * as path from 'path';
import * as fs from 'fs-extra';
import { starrail } from '../proto/starrail';


type SubAffix = {
    sub_affix_id: number;
    count: number;
    step: number;
}

export class RelicJson {
    public level: number;
    public relic_id: number;
    public relic_set_id: number;
    public main_affix_id: number;
    public sub_affixes: SubAffix[];
    public internal_uid: number;
    public equip_avatar: number;

    constructor(
        level: number, 
        relic_id: number, 
        relic_set_id: number, 
        main_affix_id: number, 
        sub_affixes: SubAffix[], 
        internal_uid: number, 
        equip_avatar: number
    ) {
        this.level = level;
        this.relic_id = relic_id;
        this.relic_set_id = relic_set_id;
        this.main_affix_id = main_affix_id;
        this.sub_affixes = sub_affixes;
        this.internal_uid = internal_uid;
        this.equip_avatar = equip_avatar;
    }
    public static fromJson(json: any): RelicJson {
        return new RelicJson(
            json.level,
            json.relic_id,
            json.relic_set_id,
            json.main_affix_id,
            json.sub_affixes,
            json.internal_uid,
            json.equip_avatar
        );
    }
    public to_relic_proto(): starrail.Relic {
        return new starrail.Relic({
            charId: this.equip_avatar,
            exp: 0,
            isProtected: false,
            level: this.level,
            mainAffixId: this.main_affix_id,
            id: this.relic_id,
            uniqueId: 1 + this.internal_uid,
            subAffixList: this.sub_affixes.map(v => ({
                affixId: v.sub_affix_id,
                cnt: v.count,
                step: v.step,
            })),
            // Other fields if needed
        });
    }

    public to_battle_relic_proto(): starrail.BattleRelic {
        return new starrail.BattleRelic({
            id: this.relic_id,
            level: this.level,
            mainAffixId: this.main_affix_id,
            uniqueId: this.internal_uid,
            subAffixList: this.sub_affixes.map(v => ({
                affixId: v.sub_affix_id,
                cnt: v.count,
                step: v.step,
            })),
        });
    }

    public to_equipment_relic_proto(): starrail.EquipRelic {
        return new starrail.EquipRelic({
            slot: this.relic_id % 10,
            relicUniqueId: 1 + this.internal_uid,
        });
    }
}

export class LightconeJson {
    public level: number;
    public item_id: number;
    public equip_avatar: number;
    public rank: number;
    public promotion: number;
    public internal_uid: number;

    constructor(level: number, item_id: number, equip_avatar: number, rank: number, promotion: number, internal_uid: number) {
        this.level = level;
        this.item_id = item_id;
        this.equip_avatar = equip_avatar;
        this.rank = rank;
        this.promotion = promotion;
        this.internal_uid = internal_uid;
    }
    public static fromJson(json: any): LightconeJson {
        return new LightconeJson(
            json.level,
            json.item_id,
            json.equip_avatar,
            json.rank,
            json.promotion,
            json.internal_uid
        );
    }
    public to_equipment_proto(): starrail.Equipment {
        return new starrail.Equipment({
            charId: this.equip_avatar,
            exp: 0,
            isProtected: false,
            level: this.level,
            promotion: this.promotion,
            rank: this.rank,
            id: this.item_id,
            uniqueId: 2000 + this.internal_uid
        });
    }

    public to_battle_equipment_proto(): starrail.BattleEquipment {
        return new starrail.BattleEquipment({
            id: this.item_id,
            level: this.level,
            promotion: this.promotion,
            rank: this.rank
        });
    }
}
type AvatarData = {
    rank: number,
    skills: { [key: string]: number }
}

export class AvatarJson {
    public owner_uid : number;
    public avatar_id : number;
    public data: AvatarData;
    public level : number;
    public promotion: number;
    public techniques: number[];
    public sp_value: number;
    public sp_max: number;

    constructor(
        owner_uid: number,
        avatar_id: number,
        data: AvatarData,
        level: number,
        promotion: number,
        techniques: number[],
        sp_value: number,
        sp_max: number
    ) {
        this.owner_uid = owner_uid;
        this.avatar_id = avatar_id;
        this.data = data;
        this.level = level;
        this.promotion = promotion;
        this.techniques = techniques;
        this.sp_value = sp_value;
        this.sp_max = sp_max;
    }
    public static fromJson(json: any): AvatarJson {
        return new AvatarJson(
            json.owner_uid,
            json.avatar_id,
            json.data,
            json.level,
            json.promotion,
            json.techniques,
            json.sp_value,
            json.sp_max
        );
    }
    public to_avatar_proto(lightcone?: LightconeJson, relics: RelicJson[] = []): starrail.Avatar {

        return new starrail.Avatar({
            baseAvatarId: this.avatar_id,
            exp: 0,
            level: this.level,
            promotion: this.promotion,
            rank: this.data.rank,
            skilltreeList: Object.entries(this.data.skills).map(([pointId, level]) => new starrail.AvatarSkillTree({
                pointId: Number(pointId),
                level: level,
            })),
            equipmentUniqueId: lightcone ? 2000 + lightcone.internal_uid : 0,
            equipRelicList: relics.map(relic => relic.to_equipment_relic_proto())
        });
    }

    public to_battle_avatar_proto(index: number, lightcone?: LightconeJson, relics: RelicJson[] = [],): [starrail.BattleAvatar,  starrail.BattleBuff[]] {
        const battleAvatar = new starrail.BattleAvatar({
            index: index,
            avatarType: starrail.AvatarType.AVATAR_FORMAL_TYPE,
            id: this.avatar_id,
            level: this.level,
            rank: this.data.rank,
            skilltreeList: Object.entries(this.data.skills).map(([pointId, level]) => new starrail.AvatarSkillTree({
                pointId: Number(pointId),
                level: level,
            })),
            equipmentList: lightcone ? [lightcone.to_battle_equipment_proto()] : [],
            hp: 10000,
            promotion: this.promotion,
            relicList: relics.map(relic => relic.to_battle_relic_proto()),
            worldLevel: 6,
            sp: new starrail.SpProgress({
                spCur: this.sp_value || 10000,
                spNeed: this.sp_max || 10000,
            })
        });
    
        const buffs = this.techniques.map(buffId => new starrail.BattleBuff({
            waveFlag: 0xffffffff,
            ownerIndex: index,
            level: 1,
            id: buffId,
        }));
    
        return [battleAvatar, buffs]
    }
    

    public to_lineup_avatar_proto(slot: number): starrail.LineupAvatar {
        return new starrail.LineupAvatar({
            id: this.avatar_id,
            hp: 10000,
            satiety: 100,
            avatarType: starrail.AvatarType.AVATAR_FORMAL_TYPE,
            sp: new starrail.SpProgress({
                spCur: this.sp_value || 10000,
                spNeed: this.sp_max || 10000,
            }),
            slot: slot
        });
    }

    public static to_lineup_info(lineups: { [key: string]: number }): starrail.LineupInfo {
        const lineupInfo = new starrail.LineupInfo({
            extraLineupType: starrail.ExtraLineupType.LINEUP_NONE,
            name: "KainSR",
            mp: 5,
            mpMax: 5
        });

        for (const [slot, id] of Object.entries(lineups)) {
            if (id === 0) continue;

            lineupInfo.avatarList.push(new starrail.LineupAvatar({
                id: id,
                hp: 10000,
                satiety: 100,
                avatarType: starrail.AvatarType.AVATAR_FORMAL_TYPE,
                sp: new starrail.SpProgress({
                    spCur: 10000,
                    spNeed: 10000,
                }),
                slot: lineupInfo.avatarList.length,
            }));
        }

        return lineupInfo;
    }
}


export class MonsterJson {
    public monster_id: number;
    public level: number;
    public amount: number;
    

    constructor(monster_id: number, level: number, amount: number) {
        this.monster_id = monster_id;
        this.level = level;
        this.amount = amount;
    }
    public static fromJson(json: any): MonsterJson {
        return new MonsterJson(
            json.monster_id,
            json.level,
            json.amount
        );
    }
    public to_scene_monster_info(): starrail.SceneMonsterData {
        return new starrail.SceneMonsterData({
            monsterId: this.monster_id,
        });
    }
    public static to_scene_monster_wave(wave_index: number, monsters: MonsterJson[]): starrail.SceneMonsterWave {
        if (wave_index < 1) {
            wave_index += 1;
        }

        return new starrail.SceneMonsterWave({
            waveIndex: wave_index,
            monsterWaveParam: {
                level: monsters.reduce((max, monster) => Math.max(max, monster.level), 0),
            },
            monsterList: monsters.map(v => v.to_scene_monster_info()),
        });
    }

    public static to_scene_monster_waves(monsters: MonsterJson[][]): starrail.SceneMonsterWave[] {
        return monsters
            .map((wave, index) => this.to_scene_monster_wave(index + 1, wave));
    }
}

type DynamicKeyJson = {
    key: string;
    value: number;
}

//BattleBuff
class BattleBuffJson {
    level: number;
    id: number;
    dynamic_key?: DynamicKeyJson;

    constructor(level: number, id: number, dynamic_key?: DynamicKeyJson) {
        this.level = level;
        this.id = id;
        this.dynamic_key = dynamic_key;
    }
    public static fromJson(json: any): BattleBuffJson {
        return new BattleBuffJson(
            json.level,
            json.id,
            json.dynamic_key
        );
    }
    public to_battle_buff_proto(): starrail.BattleBuff {
        return new starrail.BattleBuff({
            id: this.id,
            level: this.level,
            waveFlag: 0xffffffff,
            ownerIndex: 0xffffffff,
            dynamicValues: this.dynamic_key ? {
                [this.dynamic_key.key]: this.dynamic_key.value
            } : {}
        });
    }
}


enum BattleTypJson {
    Default = 0,
    MOC = 1,
    PF = 2,
    SU = 3,
    AS = 4,
}
export class BattleConfigJson {
    public battle_type: string;
    public blessings: BattleBuffJson[]
    public custom_stats: SubAffix[];
    public cycle_count: number;
    public stage_id:number;
    public path_resonance_id: number;
    public monsters: MonsterJson[][]

    constructor(
        battle_type: string,
        blessings: BattleBuffJson[],
        custom_stats: SubAffix[],
        cycle_count: number,
        stage_id: number,
        path_resonance_id: number,
        monsters: MonsterJson[][]
    ) {
        this.battle_type = battle_type;
        this.blessings = blessings;
        this.custom_stats = custom_stats;
        this.cycle_count = cycle_count;
        this.stage_id = stage_id;
        this.path_resonance_id = path_resonance_id;
        this.monsters = monsters;
    }
    public static fromJson(json: any): BattleConfigJson {
        return new BattleConfigJson(
            json.battle_type,
            json.blessings.map(BattleBuffJson.fromJson),
            json.custom_stats,
            json.cycle_count,
            json.stage_id,
            json.path_resonance_id,
            json.monsters.map((monsterArray: any[]) => monsterArray.map(MonsterJson.fromJson))
        );
    }
}



export class JsonData {
    public lightcones: LightconeJson[];
    public relics: RelicJson[];
    public avatars: { [key: string] : AvatarJson };
    public battle_config: BattleConfigJson;


    constructor() {

    }

    public async loadJson(filePath: string): Promise<JsonData> {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        this.lightcones = jsonData.lightcones.map(LightconeJson.fromJson);
        this.relics = jsonData.relics.map(RelicJson.fromJson);
        this.avatars = Object.fromEntries(
            Object.entries(jsonData.avatars).map(([key, value]) => [key, AvatarJson.fromJson(value)])
        );
        this.battle_config = BattleConfigJson.fromJson(jsonData.battle_config);
        return this;
    }
}


