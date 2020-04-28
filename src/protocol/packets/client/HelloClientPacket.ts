import ClientPacket from '../ClientPacket'
import { writeBinaryString } from '../../../writer'
import { writeVarint } from '../../../varint'
import { ClientPacketTypes } from '../../enums'

interface HelloClientPacketData {
  clientName: string;
  clientMajorVersion: number;
  clientMinorVersion: number;
  clientRevision: number;
  database: string;
  user: string;
  password: string;
}

export default class HelloClientPacket extends ClientPacket<HelloClientPacketData> {
  type = ClientPacketTypes.HELLO
  _write (data: HelloClientPacketData): void {
    console.log(data)
    writeBinaryString(data.clientName, this.stream)
    writeVarint(data.clientMajorVersion, this.stream)
    writeVarint(data.clientMinorVersion, this.stream)
    writeVarint(data.clientRevision, this.stream)
    writeBinaryString(data.database, this.stream)
    writeBinaryString(data.user, this.stream)
    writeBinaryString(data.password, this.stream)
  }
}
