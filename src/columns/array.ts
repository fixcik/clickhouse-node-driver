import { readBinaryInt32, readBinaryInt16, readBinaryUInt32, readBinaryUInt64 } from './../reader'
import { readVarUint } from './../varint'
import Column from './column'
import Connection from '../сonnection'

export class ArrayColumn extends Column {
  nested: Column
  constructor (nested: Column) {
    super()
    this.nested = nested
  }

  _readSize (conn: Connection): Promise<BigInt> {
    return readBinaryUInt64(conn.readStream)
  }

  async _readData (conn: Connection, count: number, nullMap: any): Promise<unknown[]> {
    if (count === 0) {
      return []
    }
    const c1 = await readBinaryUInt64(conn.readStream)
    const c2 = await readBinaryUInt64(conn.readStream)
    const c3 = await readBinaryUInt64(conn.readStream)
    const c4 = await readBinaryUInt64(conn.readStream)
    // const c3 = await readBinaryUInt64(conn.readStream)
    // console.log(await this._readSize(conn))
    console.log(c1, c2, c3, c4)
    process.exit()

    return []
  }
}
