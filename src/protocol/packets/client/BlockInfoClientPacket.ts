import { writeVarint } from '../../../varint'
import { writeBinaryUInt8, writeBinaryInt32 } from '../../../writer'
import ClientPacket from '../ClientPacket'
import { BlockInfo } from '../../../block/BaseBlock'

export interface BlockInfoClientPacketData {
  info: BlockInfo;
}

export default class BlockInfoPacket extends ClientPacket<BlockInfoClientPacketData> {
  _write ({ info }: BlockInfoClientPacketData): void {
    writeVarint(1, this.stream)
    writeBinaryUInt8(Number(info.isOverflows), this.stream)
    writeVarint(2, this.stream)
    writeBinaryInt32(info.bucketNum, this.stream)
    writeVarint(0, this.stream)
  }
}
