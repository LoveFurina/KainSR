import * as fs from 'fs';
import * as path from 'path';
import * as protobuf from 'protobufjs';

// Đường dẫn đến file .proto của bạn
const protoFilePath = path.resolve(__dirname, 'starrail.proto');

// Đường dẫn đến file xuất
const outputFilePath = path.resolve(__dirname, 'cmdId.ts');

async function extractCmdIds() {
    const root = await protobuf.load(protoFilePath);
    const cmdIds: { [key: string]: number } = {};

    function traverseNamespace(namespace: protobuf.NamespaceBase) {
        namespace.nestedArray.forEach(nested => {
            if (nested instanceof protobuf.Enum) {
                if (nested.name.toLowerCase().includes('cmd')) {
                    Object.entries(nested.values).forEach(([key, value]) => {
                        cmdIds[key] = value as number;
                    });
                }
            }
            if (nested instanceof protobuf.Namespace) {
                traverseNamespace(nested);
            }
        });
    }

    traverseNamespace(root);

    const outputContent = `export const CmdID: { [key: string]: number } = ${JSON.stringify(cmdIds, null, 4)};\n`;
    fs.writeFileSync(outputFilePath, outputContent, 'utf-8');
    console.log(`File ${outputFilePath} đã được tạo thành công.`);
}

extractCmdIds().catch(console.error);
