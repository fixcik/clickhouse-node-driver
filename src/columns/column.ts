import { readBinaryUInt8 } from './../reader'
import Connection from '../сonnection'
import { NotImplementedError } from '../exceptions'

export default class Column {
  nullable = false
  static chType = ''
  nullValue = null
  async readData (conn: Connection, count: number): Promise<unknown[]> {
    let nullMap = null
    if (this.nullable) {
      nullMap = await this._readNullsMap(conn, count)
    }
    return this._readData(conn, count, nullMap)
  }

  async _readData (conn: Connection, count: number, nullMap: any): Promise<unknown[]> {
    let items = await this.readItems(conn, count)
    if (nullMap) {
      items = items.map((v, i) => nullMap[i] ? this.nullValue : v)
    }
    return items
  }

  async _readNullsMap (conn: Connection, count: number) {
    const nullMap = []
    for (let i = 0; i < count; i++) {
      nullMap.push(await readBinaryUInt8(conn.readStream))
    }
    return nullMap
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async readItems (conn: Connection, count: number): Promise<unknown[]> {
    throw new NotImplementedError()
  }
}
