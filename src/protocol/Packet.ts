import Connection from '../Connection'
import { NotImplementedError } from '../exceptions'

export default class Packet {
  conn: Connection
  constructor (conn: Connection) {
    this.conn = conn
  }

  get stream (): unknown {
    throw new NotImplementedError()
  }
}
