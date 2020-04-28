import Connection, { ConnectionOptions } from './Connection'

export type ClientOptions = ConnectionOptions

export default class Client {
  connection: Connection
  constructor (opts: ClientOptions) {
    this.connection = new Connection(opts)
  }

  async processOrdinaryQuery (query: string) {
    await this.connection.sendQuery(query)
    this.connection.sendExternalTables()
    await this.connection.readPacket()
    console.log('data')
  }
}
