import { NotImplementedError } from '../../exceptions'
import Packet from '../Packet'
import BufferedStreamReader from '../../streams/BufferedStreamReader'

export enum ServerPacketTypes {
  HELLO,
  DATA,
  EXCEPTION,
  PROGRESS,
  PONG,
  END_OF_STREAM,
  PROFILE_INFO,
  TOTALS,
  EXTREMES,
  TABLES_STATUS_RESPONSE,
  LOG,
  TABLE_COLUMNS
}

export default class ServerPacket<T, S = BufferedStreamReader> extends Packet<S> {
  _readed = false;
  _data!: T;
  async read (): Promise<this> {
    this._data = await this._read()
    this._readed = true
    return this
  }

  async _read (): Promise<T> {
    throw new NotImplementedError()
  }

  getData (): T {
    return this._data
  }
}
