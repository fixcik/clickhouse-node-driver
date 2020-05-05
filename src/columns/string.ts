import { readBinaryString, readBinaryStringFixedLength } from '../reader'
import Connection from '../сonnection'
import Column from './column'

export class StringColumn extends Column {
    static chType = 'String'
    async readItems (conn: Connection, count: number | bigint): Promise<string[]> {
      const res = []
      for (let _ = BigInt(0); _ < BigInt(count); _++) {
        res.push(await readBinaryString(conn.readStream))
      }
      return res
    }
}

export class FixedStringColumn extends Column {
    static chType = 'FixedString'
    length: number
    constructor (length: number) {
      super()
      this.length = length
    }

    async readItems (conn: Connection, count: number): Promise<Buffer[]> {
      const res = []
      for (let _ = 0; _ < count; _++) {
        res.push(await readBinaryStringFixedLength(conn.readStream, this.length))
      }
      return res
    }
}
