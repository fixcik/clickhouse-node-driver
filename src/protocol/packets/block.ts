import { ServerPacket, ClientPacket } from '../packet'
import { readBinaryInt32, readBinaryUInt8 } from '../../reader'
import { readVarUint, writeVarint } from '../../varint'
import { BlockInfo, BaseBlock } from '../../block'
import { writeBinaryUInt8, writeBinaryInt32, writeBinaryString } from '../../writer'
import * as defines from '../../defines'

export interface BlockInfoClientPacketData {
    info: BlockInfo;
  }

export class BlockInfoClientPacket extends ClientPacket<BlockInfoClientPacketData> {
  _write ({ info }: BlockInfoClientPacketData): void {
    writeVarint(1, this.stream)
    writeBinaryUInt8(Number(info.isOverflows), this.stream)
    writeVarint(2, this.stream)
    writeBinaryInt32(info.bucketNum, this.stream)
    writeVarint(0, this.stream)
  }
}

export interface BlockInfoServerPacketData {
  info: BlockInfo;
}
export class BlockInfoServerPacket extends ServerPacket<BlockInfoServerPacketData> {
  async _read (): Promise<BlockInfoServerPacketData> {
    let isOverflows
    let bucketNum
    while (true) {
      const fieldNum = await readVarUint(this.stream)
      if (!fieldNum) {
        break
      }

      if (fieldNum === 1) {
        isOverflows = Boolean(await readBinaryUInt8(this.stream))
      } else if (fieldNum === 2) {
        bucketNum = await readBinaryInt32(this.stream)
      }
    }
    return {
      info: new BlockInfo({
        isOverflows,
        bucketNum
      })
    }
  }
}

export interface BlockPacketData {
  block: BaseBlock;
}

export class BlockPacket extends ClientPacket<BlockPacketData> {
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
