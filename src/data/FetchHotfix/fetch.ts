import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { decode, simplify } from "./decoder";
import { Dispatch } from "./dispatch";



const readString = (buffer: Buffer, offset: number = 0): string => {
    const lengthByte = buffer.readUInt8(offset);
    const endPos = offset + lengthByte + 1;
    const stringData = buffer.toString('utf8', offset + 1, endPos);
    return stringData;
};

const stripEmptyBytes = (buffer: Buffer): Buffer => {
    let end = buffer.length;
    while (end > 0 && buffer[end - 1] === 0x00) {
    end--;
    }
    return buffer.subarray(0, end);
}

const lastIndexOf = (buffer: Buffer, delimiter: number) => {
    let start = 0;
    const parts = [];
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === delimiter) {
            parts.push(buffer.subarray(start, i));
            start = i + 1;
        }
    }
    if (start < buffer.length) {
        parts.push(buffer.subarray(start));
    }
    return parts[parts.length - 1];
}

function readUint24BE(buffer:Buffer, offset = 0): number {
    return (buffer[offset] << 16) | (buffer[offset + 1] << 8) | buffer[offset + 2];
}

function seedSanityCheck(dispatchSeed: string): boolean {
    // Seed will always be a hexadecimal string
    return /^[0-9A-Fa-f]*$/.test(dispatchSeed);
}

function splitBuffer(buffer: Buffer, delimiter: number) {
    const result:Buffer[] = [];
    let start = 0;
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === delimiter) {
            if (i > start) {
                result.push(buffer.subarray(start, i));
            }
            start = i + 1;
        }
    }
    if (start < buffer.length) {
        result.push(buffer.subarray(start));
    }
    return result;
}

// Couldn't find a better solution for this
function getDispatchSeed(buffersplits: Buffer[], constructedString: string): { version: string, seed: string } | null {
    for (let i = 1; i < buffersplits.length; i++) {
        if (buffersplits[i].length < 2) {
            continue;
        }
        if (readString(buffersplits[i]).startsWith(constructedString)) {
            const seed = readString(buffersplits[i - 1]);
            if (seedSanityCheck(seed)) {
                return { version: readString(buffersplits[i]), seed: seed };
            } else {
                return null;
            }
        }
    }
    return null;
}

function extractLuaVersion(url: string): string | null {
    const regex = /output_(\d+)_/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export async function fetchVersionData(StarRailDir: string) {
    const buffer_BinaryVersion: Buffer = fs.readFileSync(path.join(StarRailDir, 'StarRail_Data', 'StreamingAssets', 'BinaryVersion.bytes'));
    const buffer_ClientConfig: Buffer = fs.readFileSync(path.join(StarRailDir, 'StarRail_Data', 'StreamingAssets', 'ClientConfig.bytes'));

    const buffer_ClientConfig_parts = stripEmptyBytes(buffer_ClientConfig);
    const query_dispatch_pre:string = readString(lastIndexOf(buffer_ClientConfig_parts, 0x00), 0);
    
    // TODO: parse the entire buffer properly
    const zeroPattern = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const lastbuffer = buffer_BinaryVersion.subarray(buffer_BinaryVersion.lastIndexOf(zeroPattern) + zeroPattern.length);
    const buffersplits = splitBuffer(lastbuffer, 0x00).filter((buffer: Buffer) => buffer.length > 0);
    const Branch = readString(buffer_BinaryVersion, 1);
    const Revision = readUint24BE(buffersplits[0]);
    const Time = readString(buffersplits[1]);
    const { version: versionStr, seed: seedStr } = getDispatchSeed(buffersplits, `${Time}-${Branch}-${Revision}`) || {};
    
    if (versionStr == null || seedStr == null) {
        console.log(`Unable to parse dispatch seed for this game version, please ensure you entered the correct game path and try again.`);
        process.exit(1);
    }

    console.log(`Dispatch Seed: ${seedStr}`);

    // Get the version number
    const versionSplit = versionStr.split('-');
    const version:string = versionSplit[versionSplit.length - 2];
    const build:string = versionSplit[versionSplit.length - 1];
    
    console.log(`Version: ${version}`);
    console.log(`Build: ${build}`);

    // For the switch
    let urlStart;

    // The data to return
    const returnData = {
        asset_bundle_url: "",
        ex_resource_url: "",
        lua_url: "",
        ifixUrl: "",
        lua_version: "",
        customMdkResVersion: 0,
        customIfixVersion: 0,
    }

    // Fetch the dispatch
    try {
        const url_dispatch = `${query_dispatch_pre}?version=${version}&language_type=3&platform_type=3&channel_id=1&sub_channel_id=1&is_new_format=1`;
        const response_dispatch = await axios.get(url_dispatch);
        const protoBytes_dispatch = Buffer.from(response_dispatch.data, 'base64');
        const decodedDispatch:Dispatch = Dispatch.decode(protoBytes_dispatch);
        if (decodedDispatch.regionList.length == 0) {
            console.log('No regions found, make sure the version is correct and the game is not in maintenance mode');
            return;
        }
        urlStart = decodedDispatch.regionList[0].dispatchUrl.toString();
    } catch (error) {
        console.error('Error fetching dispatch:', error);
    }

    // construct the url
    const url = `${urlStart}?version=${version}&platform_type=1&language_type=3&dispatch_seed=${seedStr}&channel_id=1&sub_channel_id=1&is_need_url=1`;

    // fetch the url
    try {
        const response = await axios.get(url);
        const protoBytes = Buffer.from(response.data, 'base64');
        const decoded = decode(protoBytes);
        const simplified = simplify(decoded);
        for (const field of simplified.fields) {
            const val:string = field.value.toString();
            if (val.includes('/asb/')) {
                returnData.asset_bundle_url = val;
            } else if (val.includes('/design_data/')) {
                returnData.ex_resource_url = val;
            } else if (val.includes('/lua/')) {
                returnData.lua_url = val;
                returnData.lua_version = extractLuaVersion(val);
            } else if (val.includes('/ifix/')) {
                returnData.ifixUrl = val;
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    // Finally, output the data to a file
    return returnData;

}

