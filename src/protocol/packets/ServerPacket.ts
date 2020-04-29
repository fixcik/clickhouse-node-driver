import { NotImplementedError } from '../../exceptions'
import Packet from '../Packet'
import { BufferedReader } from '../../BufferedStreamReader'

export default class ServerPacket<T> extends Packet {
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
