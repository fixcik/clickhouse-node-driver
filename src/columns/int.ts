import Column from './column'
import { readBinaryInt } from '../reader'
import Connection from '../сonnection'

class IntColumn extends Column {
  intSize = 0
  unsigned = false
  async readItems (conn: Connection, count: number | bigint): Promise<number[]> {
    const res = []
    for (let _ = BigInt(0); _ < BigInt(count); _++) {
      res.push(await readBinaryInt(conn.readStream, this.intSize, this.unsigned))
    }
    return res
  }
}

class UIntColumn extends IntColumn {
  unsigned = true
}

export class UInt8Column extends UIntColumn {
  intSize = 1
  static chType = 'UInt8'
}

export class UInt16Column extends UIntColumn {
  intSize = 2
  static chType = 'UInt16'
}

export class UInt32Column extends UIntColumn {
  intSize = 4
  static chType = 'UInt32'
}

export class Int8Column extends IntColumn {
  intSize = 1
  static chType = 'UInt8'
}

export class Int16Column extends IntColumn {
  intSize = 2
  static chType = 'UInt16'
}

export class Int32Column extends IntColumn {
  intSize = 4
  static chType = 'UInt32'
}
