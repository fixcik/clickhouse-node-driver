import { PacketOptions } from './../Packet'
import { NotImplementedError } from '../../exceptions'
import Packet from '../Packet'
import { writeVarint } from '../../varint'
import { Writable } from 'stream'

export interface ClientPacketOptions<T, S> extends PacketOptions<S> {
  data: T;
}

export enum ClientPacketTypes {
  HELLO,
  QUERY,
  DATA,
  CANCEL,
  PING,
  TABLES_STATUS_REQUEST
}

export default class ClientPacket<T, S extends NodeJS.WritableStream = Writable> extends Packet<S> {
  type!: ClientPacketTypes
  data: T
  constructor ({ data, ...opts }: ClientPacketOptions<T, S>) {
    super(opts)
    this.data = data
  }

  write (): void {
    writeVarint(this.type, this.stream)
    this._write(this.data)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _write (data: T): void {
    throw new NotImplementedError()
  }
}
