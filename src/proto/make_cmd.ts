import * as fs from 'fs';
import * as path from 'path';
import * as protobuf from 'protobufjs';

// Path to your .proto file
const protoFilePath = path.resolve(process.cwd(), 'src/proto/HSR_2.4.53_LitianLeak.proto');

// Path to the output file
const outputFilePath = path.resolve(process.cwd(), 'src/proto/cmdId.ts');

async function extractCmdIds() {
    const root = await protobuf.load(protoFilePath);
    const cmdIds: { [key: string]: number } = {};

    function traverseNamespace(namespace: protobuf.NamespaceBase) {
        namespace.nestedArray.forEach(nested => {
            if (nested instanceof protobuf.Enum) {
                const values = nested.toJSON().values as { [key: string]: number };
                
                // Iterate through the fields of the enum
                Object.entries(values).forEach(([key, value]) => {
                    // Check if the field name starts with "cmd" (case-insensitive)
                    if (key.toLowerCase().startsWith('cmd')) {
                        cmdIds[key] = value;
                    }
                });
            }

            if (nested instanceof protobuf.Namespace) {
                traverseNamespace(nested);
            }
        });
    }

    traverseNamespace(root);

    const outputContent = `export const CmdID: { [key: string]: number } = ${JSON.stringify(cmdIds, null, 4)};\n`;
    fs.writeFileSync(outputFilePath, outputContent, 'utf-8');
    console.log(`File ${outputFilePath} has been successfully created.`);
}

extractCmdIds().catch(console.error);
