import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import { fetchVersionData } from './FetchHotfix/fetch';
import { JsonData } from './loadFreeData';
import { DataInGame } from './loadDataInGame';
import { GameResources } from './loadResources';
import { NetSession } from 'src/game-server/NetSession';
import { starrail } from 'src/proto/starrail';
import { CmdID } from 'src/proto/cmdId';


export interface VersionConfig {
    [key: string]: {
        asset_bundle_url: string;
        ex_resource_url: string;
        lua_url: string;
        lua_version: string;
        ifixUrl: string;
    };
}

@Injectable()
export class DataService {
    private dataVersion: VersionConfig;
    private dirFolderGame: string | null;
    private dataJson: JsonData
    private dataInGame: DataInGame
    private dataRecourse: GameResources
    private mainId: number
    private march7Id: number
    constructor() {
        // version input
        const filePathVersion = path.resolve(process.cwd(),'./src/data/version.json');
        const fileContentsVersion = fs.readFileSync(filePathVersion, 'utf-8');
        this.dataVersion = JSON.parse(fileContentsVersion) as VersionConfig;

        //Check exist folder game
        this.dirFolderGame = null;
        this.checkStarRailFolders()

        //Data Json
        this.dataJson = new JsonData();
        this.updateDataJson()

        //Data In-game
        this.dataInGame = new DataInGame();
        this.updateDataInGame()

        //load GameResources
        this.dataRecourse = new GameResources();
        this.updateDataResource()

        this.mainId = 8006
        this.march7Id = 1224
    }

    getVersionData(): VersionConfig {
        return this.dataVersion;
    }

    async getUpdateIdChar(id: number, player: NetSession) {
        let avatarType: starrail.MultiPathAvatarType = starrail.MultiPathAvatarType.MultiPathAvatarTypeNone;
        switch (id) {
            case 8001:
                this.mainId = 8001
                avatarType = starrail.MultiPathAvatarType.BoyWarriorType;
                break;
            case 8002:
                this.mainId = 8002
                avatarType = starrail.MultiPathAvatarType.GirlWarriorType;
                break;
            case 8003:
                this.mainId = 8003
                avatarType = starrail.MultiPathAvatarType.BoyKnightType;
                break;
            case 8004:
                this.mainId = 8004
                avatarType = starrail.MultiPathAvatarType.GirlKnightType;
                break;
            case 8005:
                this.mainId = 8005
                avatarType = starrail.MultiPathAvatarType.BoyShamanType;
                break;
            case 8006:
                this.mainId = 8006
                avatarType = starrail.MultiPathAvatarType.GirlShamanType;
                break;
            case 1224:
                this.march7Id = 1224
                avatarType = starrail.MultiPathAvatarType.Mar_7thRogueType;
                break;
            case 1001:
                this.march7Id = 1001
                avatarType = starrail.MultiPathAvatarType.Mar_7thKnightType;
                break;
            default:
                avatarType = starrail.MultiPathAvatarType.MultiPathAvatarTypeNone;
                break;
        }
        const proto1 = new starrail.SetAvatarPathScRsp({
            retcode: 0,
            avatarId: avatarType
        });
        const bufferData1 = starrail.SetAvatarPathScRsp.encode(proto1).finish();
        await player.send(CmdID.CmdSetAvatarPathScRsp, bufferData1);
    }

    getDataJson() : JsonData{
        return this.dataJson;
    }

    getDataInGame() : DataInGame {
        return this.dataInGame;
    }
    getIdMain() {
        return this.mainId
    }
    getIdM7() {
        return this.march7Id
    }
    getDataResource() : GameResources {
        return this.dataRecourse;
    }

    checkStarRailFolders = () => {
        const baseDir = join(__dirname, '..', '..');
        const targetFolders = ['Star Rail', 'StarRail'].map(folder => folder.toLowerCase());
        const directories = readdirSync(baseDir).filter(file => {
            const fullPath = join(baseDir, file);
            return statSync(fullPath).isDirectory();
        });
    
        const foundFolders = directories.filter(directory => 
            targetFolders.some(target => directory.toLowerCase().startsWith(target))
        );
    
        if (foundFolders.length > 0) {
            this.dirFolderGame = join(__dirname, '..', '..', foundFolders[0]);
            console.log("Folder game detected: ", this.dirFolderGame)
        } 
    };

    saveVersion() {
        const filePathVersion = path.resolve(process.cwd(), './src/data/version.json');
        const updatedContentsVersion = JSON.stringify(this.dataVersion, null, 2);
        fs.writeFileSync(filePathVersion, updatedContentsVersion, 'utf-8');
    }

    async autoUpdateVersion(version: string) : Promise<boolean> {
        if (!this.dirFolderGame) return false;
        const dataReturn = await fetchVersionData(this.dirFolderGame)
        console.log(dataReturn)
        if (dataReturn) {
            this.dataVersion[version] = dataReturn;
            this.saveVersion()
            return true;
        }
        return false;
    }

    async updateDataJson() {
        const filePathJson = path.resolve(process.cwd(), './src/data/freesr-data.json');
        this.dataJson = await this.dataJson.loadJson(filePathJson)
    }

    async updateDataInGame() {
        const filePathJson = path.resolve(process.cwd(), './src/data/data-in-game.json');
        this.dataInGame = await this.dataInGame.loadJson(filePathJson)
    }

    async saveDataLineUp(lineups: { [key: string]: number }) {
        const filePathJson = path.resolve(process.cwd(), './src/data/data-in-game.json');
        this.dataInGame.lineups = lineups
        await this.dataInGame.saveJson(filePathJson)
    }

    async updateDataResource() {
        const filePathJson = path.resolve(process.cwd(), './src/data/resources.json');
        this.dataRecourse = await this.dataRecourse.loadJson(filePathJson)
    }
}
