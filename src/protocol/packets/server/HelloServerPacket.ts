import { readBinaryString } from './../../../reader'
import { readVarUint } from './../../../varint'
import ServerPacket from '../ServerPacket'
import { DBMS_MIN_REVISION_WITH_SERVER_TIMEZONE, DBMS_MIN_REVISION_WITH_SERVER_DISPLAY_NAME, DBMS_MIN_REVISION_WITH_VERSION_PATCH } from '../../../defines'

export interface HelloServerPacketData {
  serverName: string;
  serverVersionMajor: number;
  serverVersionMinor: number;
  serverRevision: number;
  serverTimezone?: string;
  serverDisplayName?: string;
  serverVersionPatch?: number;
}
export default class HelloServerPacket extends ServerPacket<HelloServerPacketData> {
  async _read (): Promise<HelloServerPacketData> {
    const serverName = await readBinaryString(this.stream)
    const serverVersionMajor = await readVarUint(this.stream)
    const serverVersionMinor = await readVarUint(this.stream)
    const serverRevision = await readVarUint(this.stream)

    let serverTimezone

    if (serverRevision > DBMS_MIN_REVISION_WITH_SERVER_TIMEZONE) {
      serverTimezone = await readBinaryString(this.stream)
    }

    let serverDisplayName

    if (serverRevision > DBMS_MIN_REVISION_WITH_SERVER_DISPLAY_NAME) {
      serverDisplayName = await readBinaryString(this.stream)
    }

    let serverVersionPatch

    if (serverRevision > DBMS_MIN_REVISION_WITH_VERSION_PATCH) {
      serverVersionPatch = await readVarUint(this.stream)
    }

    return {
      serverName,
      serverVersionMajor,
      serverVersionMinor,
      serverRevision,
      serverTimezone,
      serverDisplayName,
      serverVersionPatch
    }
  }
}
