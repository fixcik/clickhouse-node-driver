import Connection from '../сonnection'
import { NotImplementedError } from '../exceptions'

export default class Column {
  nullable = false
  static chType = ''
  nullValue = null
  readData (conn: Connection, count: number): Promise<unknown[]> {
    let nullMap = null
    if (this.nullable) {
      nullMap = this._readNullsMap(conn, count)
    }
    return this._readData(conn, count, nullMap)
  }

  async _readData (conn: Connection, count: number, nullMap: any): Promise<unknown[]> {
    const items = await this.readItems(conn, count)
    if (nullMap) {
      // TODO: hanle null map
    }
    return items
  }

  _readNullsMap (conn: Connection, count: number) {
    // TODO: read null map
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async readItems (conn: Connection, count: number): Promise<unknown[]> {
    throw new NotImplementedError()
  }
}
