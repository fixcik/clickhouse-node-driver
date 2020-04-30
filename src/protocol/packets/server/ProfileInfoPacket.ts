import ServerPacket from '../ServerPacket'
import { readVarUint } from '../../../varint'
import { readBinaryUInt8 } from '../../../reader'

export interface ProfileInfoPacketData {
    rows: number;
    blocks: number;
    bytes: number;
    appliedLimit: boolean;
    rowsBeforeLimit: number;
    calculatedRowsBeforeLimit: number;
}
export default class ProfileInfoPacket extends ServerPacket<ProfileInfoPacketData> {
  async _read (): Promise<ProfileInfoPacketData> {
    return {
      rows: await readVarUint(this.stream),
      blocks: await readVarUint(this.stream),
      bytes: await readVarUint(this.stream),
      appliedLimit: Boolean(await readBinaryUInt8(this.stream)),
      rowsBeforeLimit: await readVarUint(this.stream),
      calculatedRowsBeforeLimit: await readVarUint(this.stream)
    }
  }
}
