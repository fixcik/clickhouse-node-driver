import { NotImplementedError } from './../exceptions'
import { Buffer } from 'buffer'

export default class Column {
  /**
   * Clickhouse type
   */
  chType = ''

  /**
   * Is nullable
   */
  nullable = false

  writeData (items: Array<any>, buf: Buffer) {
    if (this.nullable) {
      this.writeNullable(items, buf)
    }
    this._writeData(items, buf)
  }

  _writeData (items: Array<any>, buf: Buffer) {
    throw new NotImplementedError()
  }

  writeNullable (items: Array<any>, buf: Buffer) {

  }

  readData (nitems: any, buf: Buffer) {
    const items = this._readData(nitems, buf)
    return items
  }

  _readData (items: any, buf: Buffer) {
    throw new NotImplementedError()
  }
}
