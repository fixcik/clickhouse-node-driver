import { Readable } from 'stream'
import { NotImplementedError } from '../../exceptions'
import Packet from '../Packet'

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

export default class ServerPacket<T, S extends NodeJS.ReadableStream = Readable> extends Packet<S> {
  data?: T
  read (): void {
    this.data = this._read()
  }

  _read (): T {
    throw new NotImplementedError()
  }
}
