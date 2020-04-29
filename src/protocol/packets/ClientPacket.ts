import { NotImplementedError } from '../../exceptions'
import Packet from '../Packet'
import { writeVarint } from '../../varint'
import { Writable } from 'stream'
import Connection from '../../Connection'
import { ClientPacketTypes } from '../enums'

export default class ClientPacket<T> extends Packet {
  type?: ClientPacketTypes
  _data: T
  constructor (conn: Connection, data: T) {
    super(conn)
    this._data = data
  }

  get stream (): Writable {
    return this.conn.socket
  }

  write (): void {
    this.stream.cork()
    if (typeof this.type !== 'undefined') {
      writeVarint(this.type, this.stream)
    }
    this._write(this._data)
    this.stream.uncork()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _write (data: T): void {
    throw new NotImplementedError()
  }
}
