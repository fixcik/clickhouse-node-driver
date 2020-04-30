import { writeVarint } from './../../varint'
import { readBinaryString } from '../../reader'
import { readVarUint } from '../../varint'
import { ServerPacket, ClientPacket } from '../packet'
import { ClientPacketTypes } from '../enums'
import { writeBinaryString } from '../../writer'
import * as defines from '../../defines'

interface HelloClientPacketData {
    clientName: string;
    clientMajorVersion: number;
    clientMinorVersion: number;
    clientRevision: number;
    database: string;
    user: string;
    password: string;
  }

export class HelloClientPacket extends ClientPacket<HelloClientPacketData> {
    type = ClientPacketTypes.HELLO
    _write (data: HelloClientPacketData): void {
      writeBinaryString(data.clientName, this.stream)
      writeVarint(data.clientMajorVersion, this.stream)
      writeVarint(data.clientMinorVersion, this.stream)
      writeVarint(data.clientRevision, this.stream)
      writeBinaryString(data.database, this.stream)
      writeBinaryString(data.user, this.stream)
      writeBinaryString(data.password, this.stream)
    }
}

export interface HelloServerPacketData {
  serverName: string;
  serverVersionMajor: number;
  serverVersionMinor: number;
  serverRevision: number;
  serverTimezone?: string;
  serverDisplayName?: string;
  serverVersionPatch?: number;
}
export class HelloServerPacket extends ServerPacket<HelloServerPacketData> {
  async _read (): Promise<HelloServerPacketData> {
    const serverName = await readBinaryString(this.stream)
    const serverVersionMajor = await readVarUint(this.stream)
    const serverVersionMinor = await readVarUint(this.stream)
    const serverRevision = await readVarUint(this.stream)

    let serverTimezone

    if (serverRevision > defines.DBMS_MIN_REVISION_WITH_SERVER_TIMEZONE) {
      serverTimezone = await readBinaryString(this.stream)
    }

    let serverDisplayName

    if (serverRevision > defines.DBMS_MIN_REVISION_WITH_SERVER_DISPLAY_NAME) {
      serverDisplayName = await readBinaryString(this.stream)
    }

    let serverVersionPatch

    if (serverRevision > defines.DBMS_MIN_REVISION_WITH_VERSION_PATCH) {
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
