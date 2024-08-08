import * as fs from 'fs';
import * as path from 'path';

export enum LoadSide {
    Client = 0,
    Server = 1,
    Unk = 2,
}
export enum PlaneType {
    Unknown = 0,
    Maze = 2,
    Train = 3,
    Challenge = 4,
    Rogue = 5,
    Raid = 6,
    AetherDivide = 7,
    TrialActivity = 8,
    Town = 1,
}
export enum PropState {
    Closed = 0,
    Open = 1,
    Locked = 2,
    BridgeState1 = 3,
    BridgeState2 = 4,
    BridgeState3 = 5,
    BridgeState4 = 6,
    CheckPointDisable = 7,
    CheckPointEnable = 8,
    TriggerDisable = 9,
    TriggerEnable = 10,
    ChestLocked = 11,
    ChestClosed = 12,
    ChestUsed = 13,
    Elevator1 = 14,
    Elevator2 = 15,
    Elevator3 = 16,
    WaitActive = 17,
    EventClose = 18,
    EventOpen = 19,
    Hidden = 20,
    TeleportGate0 = 21,
    TeleportGate1 = 22,
    TeleportGate2 = 23,
    TeleportGate3 = 24,
    Destructed = 25,
    CustomState01 = 101,
    CustomState02 = 102,
    CustomState03 = 103,
    CustomState04 = 104,
    CustomState05 = 105,
    CustomState06 = 106,
    CustomState07 = 107,
    CustomState08 = 108,
    CustomState09 = 109,
}
export type LevelProp = {
    ID: number,
    Category: string,
    GroupName: string,
    LoadSide : LoadSide,
    PosX: number,
    PosY: number,
    PosZ: number,
    RotY: number,
    PropID: number,
    AnchorID: number,
    AnchorGroupID: number,
    MappingInfoID: number,
    InitLevelGraph: string,
    State: PropState,
    propStateList: PropState[],
    groupId: number,
    IsDelete: boolean,
    IsClientOnly: boolean,
    testField: string,
}

export type LevelAnchor = {
    ID: number,
    PosX: number,
    PosY: number,
    PosZ: number,
    RotY: number,
    group_id: number
}
export type LevelNPC = {
    ID: number,
    PosX: number,
    PosY: number,
    PosZ: number,
    Name: string,
    RotY: number,
    NPCID: number,
    group_id: number,
    IsDelete: boolean,
    IsClientOnly: boolean,
}
export type LevelMonster ={
    ID: number,
    RotY: number,
    PosX: number,
    PosY: number,
    PosZ: number,
    NPCMonsterID: number,
    EventID: number,
    group_id: number,
    IsDelete: boolean,
    IsClientOnly: boolean,
}
export type LevelGroup = {
    GroupGUID: string,
    LoadSide: LoadSide,
    LoadOnInitial: boolean,
    AnchorList: LevelAnchor[],
    MonsterList: LevelMonster[],
    PropList: LevelProp[],
    NPCList: LevelNPC[]
}

export type LevelFloor = {
    FloorID: number,
    FloorName: string,
    StartGroupID: number,
    StartAnchorID: number,
}

export type MapEntrance = {
    ID : number,
    EntranceType: PlaneType,
    PlaneID: number,
    FloorID: number,
    BeginMainMissionList: number[],
    FinishMainMissionList: number[],
    FinishSubMissionList: number[],
}

export type MazePlane = {
    PlaneID: number,
    PlaneType: PlaneType,
    SubType: number,
    MazePoolType: number,
    WorldID: number,
    StartFloorID: number,
    FloorIDList: number[],
}

export type MazeProp = {
    ID: number,
    PropType: string,
    PropStateList: PropState[]
}

export type LevelGroupItem = {
    props: LevelProp[],
    npcs: LevelNPC[],
    monsters: LevelMonster[],
    anchors: { [key: number] : LevelAnchor},
}

export type SimpleLevelGroup = {
    teleports : { [key: number] : LevelProp},
    group_items : { [key: number] : LevelGroupItem},
}
export class GameResources {
    public map_entrance : { [key: number] : MapEntrance};
    public level_group : { [key: string] : SimpleLevelGroup};
    public maze_prop : { [key: number] : MazeProp};
    public maze_plane : { [key: number] : MazePlane};
    public level_floor : { [key: string] : LevelFloor};

    public async loadJson(filePath: string): Promise<GameResources> {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        this.map_entrance = jsonData.map_entrance || {};
        this.level_group = jsonData.level_group || {};
        this.maze_prop = jsonData.maze_prop || {};
        this.maze_plane = jsonData.maze_plane || {};
        this.level_floor = jsonData.level_floor || {};
        return this
    }
}