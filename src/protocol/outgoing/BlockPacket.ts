import { writeVarint } from '../../varint'
import { writeBinaryString } from '../../writer'
import * as defines from '../../defines'
import BlockInfoClientPacket from './BlockInfoClientPacket'
import { ClientPacket } from '../_packet'
import { BaseBlock } from '../../block'

export interface BlockPacketData {
  block: BaseBlock;
}

export default class BlockPacket extends ClientPacket<BlockPacketData> {
  _write ({ block }: BlockPacketData): void {
    if (this.conn.serverInfo.revision >= defines.DBMS_MIN_REVISION_WITH_BLOCK_INFO) {
      const blockInfoPacket = new BlockInfoClientPacket(this.conn, { info: block.info })
      blockInfoPacket.write()
    }

    const colCount = block.colCount
    const rowCount = block.rowCount

    writeVarint(colCount, this.stream)
    writeVarint(rowCount, this.stream)

    for (const index in block.columns) {
      const column = block.columns[index]
      writeBinaryString(column.name, this.stream)
      writeBinaryString(column.type, this.stream)

      if (colCount) {
        try {
          block.getColumnByIndex(Number(index))
        } catch (e) {
          throw new Error('Different rows length')
        }

        // TODO: finish write column
      }
    }
  }
}
