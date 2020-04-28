import ServerPacket from '../ServerPacket'
import * as defines from '../../../defines'
import { readBinaryString } from '../../../reader'
import BlockInfoServerPacket from './BlockInfoServerPacket'
import { BlockInfo } from '../../../block/BaseBlock'
import { readVarUint } from '../../../varint'

export interface DataServerPacketData {
  info: BlockInfo;
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

    for (let i = 0; i < colCount; i++) {
      const columnName = await readBinaryString(this.stream)
      const columnType = await readBinaryString(this.stream)

      console.log(`${columnName} ${columnType}`)
    }

    console.log(`Counts: ${colCount} cols, ${rowCount} rows`)

    return {
      info
    }
  }
}
