import Connection, { ConnectionOptions } from './сonnection'

export type ClientOptions = ConnectionOptions

export default class Client {
  connection: Connection
  constructor (opts: ClientOptions) {
    this.connection = new Connection(opts)
  }

  async processOrdinaryQuery (query: string) {
    await this.connection.sendQuery(query)
    this.connection.sendExternalTables()
    const data = await this.connection.readPacket()
    // @ts-ignore
    console.log(data.getData().block)
    const data2 = await this.connection.readPacket()
    // @ts-ignore
    console.log(data2.getData().block)
    const data3 = await this.connection.readPacket()
    // @ts-ignore
    console.log(data3.getData())
  }
}
