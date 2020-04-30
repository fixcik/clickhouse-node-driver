import { ServerPacket } from '../_packet'
import { readVarUint } from '../../varint'
import * as defines from '../../defines'

export interface ProgressServerPacketData {
    rows: number;
    bytes: number;
    totalRows?: number;
    writtenRows?: number;
    writtenBytes?: number;
}

export default class ProgressServerPacket extends ServerPacket<ProgressServerPacketData> {
  async _read (): Promise<ProgressServerPacketData> {
    const rows = await readVarUint(this.stream)
    const bytes = await readVarUint(this.stream)

    let totalRows

    if (this.revision >= defines.DBMS_MIN_REVISION_WITH_TOTAL_ROWS_IN_PROGRESS) {
      totalRows = await readVarUint(this.stream)
    }

    let writtenRows
    let writtenBytes

    if (this.revision >= defines.DBMS_MIN_REVISION_WITH_CLIENT_WRITE_INFO) {
      writtenRows = await readVarUint(this.stream)
      writtenBytes = await readVarUint(this.stream)
    }

    return {
      rows,
      bytes,
      totalRows,
      writtenRows,
      writtenBytes
    }
  }
}
