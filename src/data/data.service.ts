import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
import { GameConfig, readConfig } from "./loadConfig"
import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import { fetchVersionData } from './FetchHotfix/fetch';

export interface VersionConfig {
    [key: string]: {
        asset_bundle_url: string;
        ex_resource_url: string;
        lua_url: string;
        lua_version: string;
    };
}

@Injectable()
export class DataService {
    private dataVersion: VersionConfig;
    private dataInGame: GameConfig;
    private dirFolderGame: string | null;

    constructor() {
        // version input
        const filePathVersion = path.resolve(process.cwd(),'./src/data/version.json');
        const fileContentsVersion = fs.readFileSync(filePathVersion, 'utf-8');
        this.dataVersion = JSON.parse(fileContentsVersion) as VersionConfig;

        //Game input
        this.updateDataInGame()

        //Check exist folder game
        this.dirFolderGame = null;
        this.checkStarRailFolders()
    }

    getVersionData(): VersionConfig {
        return this.dataVersion;
    }

    getDataInGame() : GameConfig{
        return this.dataInGame;
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

    async updateDataInGame() {
        const filePathConfig = path.resolve(process.cwd(),'./src/data/config.json');
        this.dataInGame = await readConfig(filePathConfig)
    }
}
