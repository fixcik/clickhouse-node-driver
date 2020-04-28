import { writeVarint } from '../../../varint'
import { writeBinaryUInt8, writeBinaryInt32 } from '../../../writer'
import ClientPacket from '../ClientPacket'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlockInfoPacketData {}

export default class BlockInfoPacket extends ClientPacket<BlockInfoPacketData> {
  isOverFlows = false
  bucketNum = -1
  _write (): void {
    writeVarint(1, this.stream)
    writeBinaryUInt8(Number(this.isOverFlows), this.stream)
    writeVarint(2, this.stream)
    writeBinaryInt32(this.bucketNum, this.stream)
    writeVarint(0, this.stream)
  }
}
