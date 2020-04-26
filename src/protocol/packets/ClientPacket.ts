import { NotImplementedError } from '../../exceptions'
import Packet from '../Packet'
import { writeVarint } from '../../varint'
import { Writable } from 'stream'

export enum ClientPacketTypes {
  HELLO,
  QUERY,
  DATA,
  CANCEL,
  PING,
  TABLES_STATUS_REQUEST
}

export default class ClientPacket<T, S extends NodeJS.WritableStream = Writable> extends Packet<T, S> {
  type!: ClientPacketTypes
  constructor (stream: S, data: T) {
    super(stream)
    this._data = data
  }

  write (): void {
    writeVarint(this.type, this.stream)
    this._write(this._data)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _write (data: T): void {
    throw new NotImplementedError()
  }
}
