import ClientPacket from '../ClientPacket'
import { writeBinaryString } from '../../../writer'
import * as defines from '../../../defines'
import ClientInfoPacket from './ClientInfoPacket'
import { writeVarint } from '../../../varint'
import { QueryProcessingStage, ClientPacketTypes } from '../../enums'

export interface QueryPacketData {
    query: string;
    queryId?: string;
}

export enum QueryKind {
  NO_QUERY = 0,
  INITIAL_QUERY = 1,
  SECONDARY_QUERY = 2
}

export default class QueryPacket extends ClientPacket<QueryPacketData> {
    type = ClientPacketTypes.QUERY
    _write (data: QueryPacketData): void {
      writeBinaryString(data.queryId || '', this.stream)

      const revision = this.conn.serverInfo.revision
      if (revision >= defines.DBMS_MIN_REVISION_WITH_CLIENT_INFO) {
        const clientInfo = new ClientInfoPacket(this.conn, {
          clientName: this.conn.clientName,
          queryKind: QueryKind.INITIAL_QUERY
        })
        clientInfo.write()
      }

      // TODO: implement settings
      // Settings are not awailable now
      writeBinaryString('', this.stream)

      writeVarint(QueryProcessingStage.COMPLETE, this.stream)
      writeVarint(this.conn.compression, this.stream)
      writeBinaryString(data.query, this.stream)
    }
}
