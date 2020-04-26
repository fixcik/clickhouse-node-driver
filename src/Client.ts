import Connection, { ConnectionOptions } from './dbapi/Connection'

class Client {
  connection: Connection
  lastQuery?: string | null
  constructor (options: ConnectionOptions) {
    this.connection = new Connection(options)
  }

  disconnect () {
    this.connection.disconnect()
    this.resetLastQuery()
  }

  resetLastQuery () {
    this.lastQuery = null
  }

  exec (query) {
    this.connection.forceConnect()
  }
}
