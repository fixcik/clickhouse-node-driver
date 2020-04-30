import * as defines from '../../defines'
import { writeBinaryString } from '../../writer'
import { ClientPacketTypes } from '../enums'
import { ClientPacket, ServerPacket } from '../packet'
import { BaseBlock, ColumnOrientedBlock, BlockInfo } from '../../block'
import { readColumn } from '../../column'
import { readBinaryString } from '../../reader'
import { ColumntInfo } from '../../typings'
import { readVarUint } from '../../varint'
import { BlockInfoServerPacket, BlockPacket } from './block'

export interface DataClientPacketData {
  block: BaseBlock;
  tableName: string;
}
export class DataClientPacket extends ClientPacket<DataClientPacketData> {
  type = ClientPacketTypes.DATA

  _write ({ block, tableName }: DataClientPacketData): void {
    if (this.conn.serverInfo.revision >= defines.DBMS_MIN_REVISION_WITH_TEMPORARY_TABLES) {
      writeBinaryString(tableName, this.stream)
    }
    const blockPacket = new BlockPacket(this.conn, { block })
    blockPacket.write()
  }
}
export interface DataServerPacketData {
    info: BlockInfo;
    block: ColumnOrientedBlock;
}

export class DataServerPacket extends ServerPacket<DataServerPacketData> {
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

  getBlock (): ColumnOrientedBlock {
    return this._data.block
  }

  getInfo (): BlockInfo {
    return this._data.info
  }
}
