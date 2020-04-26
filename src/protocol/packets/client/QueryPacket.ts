import ClientPacket, { ClientPacketTypes } from '../ClientPacket'
import { writeBinaryString } from '../../../writer'
import * as defines from '../../../defines'
import ClientInfoPacket, { QueryKind } from './ClientInfoPacket'
import { writeVarint } from '../../../varint'

export interface QueryPacketData {
    query: string;
    queryId?: string;
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

      //   write_settings(self.context.settings, self.fout)

      //   writeVarint(QueryProcessingStage.COMPLETE, self.fout)
      //   writeVarint(self.compression, self.fout)

      writeBinaryString(data.query, this.stream)
    }
}
