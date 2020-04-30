import Connection from '../сonnection'
import { NotImplementedError } from '../exceptions'
import { ClientPacketTypes } from './enums'
import { writeVarint } from '../varint'
import { Writable } from 'stream'
import { BufferedReader } from '../buffered_reader'

export class Packet {
  conn: Connection
  constructor (conn: Connection) {
    this.conn = conn
  }

  get stream (): unknown {
    throw new NotImplementedError()
  }

  get revision (): number {
    return this.conn.serverInfo.revision
  }
}

export class ClientPacket<T> extends Packet {
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

export class ServerPacket<T> extends Packet {
  _readed = false;
  _data!: T;
  async read (): Promise<this> {
    this._data = await this._read()
    this._readed = true
    return this
  }

  get stream (): BufferedReader {
    return this.conn.readStream
  }

  async _read (): Promise<T> {
    throw new NotImplementedError()
  }

  getData (): T {
    if (!this._readed) {
      throw new Error('Unreaded packet')
    }
    return this._data
  }
}
