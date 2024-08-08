import * as path from 'path';
import * as fs from 'fs-extra';
import { starrail } from 'src/proto/starrail';

export class PositionJson {
    public x: number;
    public y: number;
    public z: number;
    public rotY: number;

    constructor(x: number, y: number, z: number, rotY: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotY = rotY;
    }

    public isEmpty() {
        return this.x == 0 && this.y == 0 && this.z == 0;
    }

    public to_motion(): starrail.MotionInfo {
        return new starrail.MotionInfo({
            pos: new starrail.Vector({
                x: this.x,
                y: this.y,
                z: this.z
            }),
            rot: new starrail.Vector({
                x: 0,
                y: this.rotY,
                z: 0
            })
        });
    }
}

export class SceneJson {
    public plane_id: number;
    public floor_id: number;
    public entry_id: number;

    constructor() {
        this.plane_id = 20313;
        this.floor_id = 20313001;
        this.entry_id = 2031301;
    }
}

export class DataInGame {
    public lineups: { [key: string]: number };
    public position: PositionJson;
    public scene: SceneJson;

    constructor() {
        this.scene = new SceneJson();
        this.lineups = { '0': 8006 };
        this.position = new PositionJson(32342, 192820, 434276, 0);
    }

    public async loadJson(filePath: string): Promise<DataInGame> {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);

        this.lineups = jsonData.lineups;

        const positionData = jsonData.position;
        this.position = new PositionJson(positionData.x, positionData.y, positionData.z, positionData.rotY);

        const sceneData = jsonData.scene;
        this.scene = new SceneJson();
        this.scene.plane_id = sceneData.plane_id;
        this.scene.floor_id = sceneData.floor_id;
        this.scene.entry_id = sceneData.entry_id;

        return this;
    }

    public async saveJson(filePath: string): Promise<void> {
        const jsonData = {
            lineups: this.lineups,
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
                rotY: this.position.rotY
            },
            scene: {
                plane_id: this.scene.plane_id,
                floor_id: this.scene.floor_id,
                entry_id: this.scene.entry_id
            }
        };

        const fileContent = JSON.stringify(jsonData, null, 2);
        await fs.promises.writeFile(filePath, fileContent, 'utf-8');
    }
}
