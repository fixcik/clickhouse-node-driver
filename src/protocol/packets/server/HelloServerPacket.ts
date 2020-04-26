import { readBinaryString } from './../../../reader'
import { readVarint } from './../../../varint'
import ServerPacket from '../ServerPacket'
import { DBMS_MIN_REVISION_WITH_SERVER_TIMEZONE, DBMS_MIN_REVISION_WITH_SERVER_DISPLAY_NAME, DBMS_MIN_REVISION_WITH_VERSION_PATCH } from '../../../defines'

export interface HelloServerPacketData {
  serverName: string;
  serverVersionMajor: number;
  serverVersionMinor: number;
  serverRevision: number;
  serverTimezone?: number;
  serverDisplayName?: string;
  serverVersionPatch?: number;
}
export default class HelloServerPacket extends ServerPacket<HelloServerPacketData> {
  _read (): HelloServerPacketData {
    const serverName = readBinaryString(this.stream)
    const serverVersionMajor = readVarint(this.stream)
    const serverVersionMinor = readVarint(this.stream)
    const serverRevision = readVarint(this.stream)

    let serverTimezone

    if (serverRevision > DBMS_MIN_REVISION_WITH_SERVER_TIMEZONE) {
      serverTimezone = readVarint(this.stream)
    }

    let serverDisplayName

    if (serverRevision > DBMS_MIN_REVISION_WITH_SERVER_DISPLAY_NAME) {
      serverDisplayName = readBinaryString(this.stream)
    }

    let serverVersionPatch

    if (serverRevision > DBMS_MIN_REVISION_WITH_VERSION_PATCH) {
      serverVersionPatch = readVarint(this.stream)
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
