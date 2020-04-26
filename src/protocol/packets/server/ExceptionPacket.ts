import ServerPacket from '../ServerPacket'
import { readBinaryString, readBinaryInt32, readBinaryUInt8 } from '../../../reader'

export interface ExceptionPacketData {
    code: number;
    name: string;
    message: string;
    stackTrace: string;
    nested?: ExceptionPacketData;
}

export default class ExceptionPacket extends ServerPacket<ExceptionPacketData> {
  async _read (): Promise<ExceptionPacketData> {
    const code = await readBinaryInt32(this.stream)
    const name = await readBinaryString(this.stream)
    const message = await readBinaryString(this.stream)
    const stackTrace = await readBinaryString(this.stream)
    const hasNested = await readBinaryUInt8(this.stream)

    let nested

    if (hasNested) {
      const packet = await (new ExceptionPacket(this.stream)).read()
      nested = packet.getData()
    }

    return {
      code,
      name,
      message,
      stackTrace,
      nested
    }
  }
}
