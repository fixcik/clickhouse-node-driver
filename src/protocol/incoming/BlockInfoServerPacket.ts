import { ServerPacket } from '../packet'
import { readBinaryInt32, readBinaryUInt8 } from '../../reader'
import { readVarUint } from '../../varint'
import { BlockInfo } from '../../block'

export interface BlockInfoServerPacketData {
  info: BlockInfo;
}
export default class BlockInfoServerPacket extends ServerPacket<BlockInfoServerPacketData> {
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
