import { Socket } from "net";

export class NetPacket {
  public static readonly HEAD_MAGIC = 0x9d74c714;
  public static readonly TAIL_MAGIC = 0xd7a152c8;

  public cmdId: number;
  private head: Uint8Array;
  public body: Uint8Array;

  constructor(cmdId: number, head: Uint8Array, body: Uint8Array) {
    this.cmdId = cmdId;
    this.head = head;
    this.body = body;
  }

  public static async read(socket: Socket): Promise<NetPacket | null> {
    const buffer: Buffer = await new Promise((resolve, reject) => {
      const onData = (data: Buffer) => {
        socket.off('data', onData); // Remove listener after receiving data
        resolve(data);
      };

      socket.on('data', onData);
    });

    if (buffer.length < 16) {
      console.log('Buffer length insufficient for packet:', buffer.length);
      return null;
    }

    const readUInt32BE = (buf: Buffer, offset: number): number => {
      return buf.readUInt32BE(offset);
    };

    const readUInt16BE = (buf: Buffer, offset: number): number => {
      return buf.readUInt16BE(offset);
    };

    const headMagic = readUInt32BE(buffer, 0);
    if (headMagic !== NetPacket.HEAD_MAGIC) {
      console.log('Invalid head magic');
      return null;
    }

    const cmd_type = readUInt16BE(buffer, 4);
    const headLength = readUInt16BE(buffer, 6);
    const bodyLength = readUInt32BE(buffer, 8);

    if (buffer.length < 12 + headLength + bodyLength + 4) {
      console.log('Buffer length insufficient for entire packet:', buffer.length);
      return null;
    }

    const head = buffer.slice(12, 12 + headLength);
    const body = buffer.slice(12 + headLength, 12 + headLength + bodyLength);
    const tailMagic = readUInt32BE(buffer, 12 + headLength + bodyLength);

    if (tailMagic !== NetPacket.TAIL_MAGIC) {
      console.log('Invalid tail magic');
      return null;
    }

    return new NetPacket(cmd_type, head, body);
  }
  public build(): Uint8Array {
    const headLength = this.head.length;
    const bodyLength = this.body.length;
    const packetSize = 16 + headLength + bodyLength;

    const packet = new Uint8Array(packetSize);
    let offset = 0;

    offset = NetPacket.writeUInt32BE(packet, offset, NetPacket.HEAD_MAGIC);
    offset = NetPacket.writeUInt16BE(packet, offset, this.cmdId);
    offset = NetPacket.writeUInt16BE(packet, offset, headLength);
    offset = NetPacket.writeUInt32BE(packet, offset, bodyLength);

    packet.set(this.head, offset);
    offset += headLength;

    packet.set(this.body, offset); // Set body without trailing byte
    offset += bodyLength;

    NetPacket.writeUInt32BE(packet, offset, NetPacket.TAIL_MAGIC);

    return packet;
  }

  private static writeUInt16BE(buffer: Uint8Array, offset: number, value: number): number {
    buffer[offset++] = (value >> 8) & 0xFF;
    buffer[offset++] = value & 0xFF;
    return offset;
  }

  private static writeUInt32BE(buffer: Uint8Array, offset: number, value: number): number {
    buffer[offset++] = (value >> 24) & 0xFF;
    buffer[offset++] = (value >> 16) & 0xFF;
    buffer[offset++] = (value >> 8) & 0xFF;
    buffer[offset++] = value & 0xFF;
    return offset;
  }
}
