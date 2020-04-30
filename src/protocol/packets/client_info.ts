import os from 'os'
import * as defines from '../../defines'
import { writeBinaryUInt8, writeBinaryString } from '../../writer'
import { writeVarint } from '../../varint'
import { ClientPacket } from '../packet'
import { QueryKind } from './query'

export enum Interface {
    TCP = 1,
    HTTP = 2
}

export interface ClientInfoPacketData {
    clientName: string;
    queryKind: QueryKind;
}

export class ClientInfoPacket extends ClientPacket<ClientInfoPacketData> {
  initialUser = ''
  initialQueryId = ''
  initialAddress = '0.0.0.0:0'
  interface = Interface.TCP

  quotaKey = ''

  _write (data: ClientInfoPacketData): void {
    const revision = this.conn.serverInfo.revision
    if (revision < defines.DBMS_MIN_REVISION_WITH_CLIENT_INFO) {
      throw new Error('Method ClientInfo.write is called for unsupported server revision')
    }
    writeBinaryUInt8(data.queryKind, this.stream)

    if (data.queryKind === QueryKind.NO_QUERY) {
      return
    }

    writeBinaryString(this.initialUser, this.stream)
    writeBinaryString(this.initialQueryId, this.stream)
    writeBinaryString(this.initialAddress, this.stream)

    writeBinaryUInt8(this.interface, this.stream)

    let osUser = ''
    let hostname = ''

    try {
      hostname = os.hostname()
      const userInfo = os.userInfo()
      osUser = userInfo.username
    } catch (e) {
      // Skip error
    }

    writeBinaryString(osUser, this.stream)
    writeBinaryString(hostname, this.stream)
    writeBinaryString(this.conn.clientName, this.stream)

    writeVarint(defines.CLIENT_VERSION_MAJOR, this.stream)
    writeVarint(defines.CLIENT_VERSION_MINOR, this.stream)
    writeVarint(defines.CLIENT_REVISION, this.stream)

    if (revision >= defines.DBMS_MIN_REVISION_WITH_QUOTA_KEY_IN_CLIENT_INFO) {
      writeBinaryString(this.quotaKey, this.stream)
    }

    if (revision >= defines.DBMS_MIN_REVISION_WITH_VERSION_PATCH) {
      writeVarint(defines.CLIENT_VERSION_PATCH, this.stream)
    }
  }
}
