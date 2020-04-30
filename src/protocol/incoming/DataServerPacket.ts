import * as defines from '../../defines'
import { readBinaryString } from '../../reader'
import BlockInfoServerPacket from './BlockInfoServerPacket'
import { BlockInfo } from '../../block/BaseBlock'
import { readVarUint } from '../../varint'
import { readColumn } from '../../column'
import { ColumntInfo } from '../../typings'
import ColumnOrientedBlock from '../../block/ColumnOrientedBlock'
import { ServerPacket } from '../packet'

export interface DataServerPacketData {
  info: BlockInfo;
  block: ColumnOrientedBlock;
}
export default class DataServerPacket extends ServerPacket<DataServerPacketData> {
  async _read (): Promise<DataServerPacketData> {
    if (this.revision >= defines.DBMS_MIN_REVISION_WITH_TEMPORARY_TABLES) {
      await readBinaryString(this.stream)
    }

    let info
    if (this.revision >= defines.DBMS_MIN_REVISION_WITH_BLOCK_INFO) {
      const infoPacket = new BlockInfoServerPacket(this.conn)
      await infoPacket.read()
      info = infoPacket.getData().info
    } else {
      info = new BlockInfo()
    }

    const colCount = await readVarUint(this.stream)
    const rowCount = await readVarUint(this.stream)
    const columns = []
    const data = []

    for (let i = 0; i < colCount; i++) {
      const column: ColumntInfo = {
        name: await readBinaryString(this.stream),
        type: await readBinaryString(this.stream)
      }
      columns.push(column)
      data.push(await readColumn(this.conn, column, rowCount))
    }

    const block = new ColumnOrientedBlock({
      data,
      columns,
      info
    })

    return {
      info,
      block
    }
  }
}
