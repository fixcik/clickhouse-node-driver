import Connection, { ConnectionOptions } from './сonnection'
import { ServerPacketTypes } from './protocol/enums'
import { ExceptionPacket } from './protocol/packets/exception'
import { ProgressPacket } from './protocol/packets/progress'
import { ProfileInfoPacket } from './protocol/packets/profile'
import { ServerPacket, EndOfStreamPacket } from './protocol/packet'
import { DataServerPacket } from './protocol/packets/data'
import { QueryResult } from './result'

export type ClientOptions = ConnectionOptions

export default class Client {
  connection: Connection
  constructor (opts: ClientOptions) {
    this.connection = new Connection(opts)
  }

  async processOrdinaryQuery (query: string) {
    await this.connection.sendQuery(query)
    this.connection.sendExternalTables()
    return this.receiveResult()
  }

  async * _packetsGenerator (): AsyncIterable<DataServerPacket> {
    while (true) {
      try {
        const packet = await this._receivePacket()
        if (packet === false) {
          break
        }
        if (packet === true) {
          continue
        }
        yield packet
      } catch (e) {
        console.error(e)
      }
    }
  }

  async _receivePacket (): Promise<DataServerPacket | boolean> {
    const packet = await this.connection.readPacket()

    if (packet instanceof ExceptionPacket) {
      throw packet.getException()
    }
    if (packet instanceof ProgressPacket) {
      return true
    }
    if (packet instanceof DataServerPacket) {
      return packet
    }
    if (packet instanceof ProfileInfoPacket) {
      return true
    }
    if (packet instanceof EndOfStreamPacket) {
      return false
    }

    // TODO: change it
    throw new Error('Error')
  }

  async receiveResult () {
    const result = new QueryResult({
      packetGenerator: await this._packetsGenerator(),
      columnar: false,
      withColumns: true
    })
    return result.getResult()
  }
}
