import Column from './column'
import { readBinaryInt, readBinaryInt64, readBinaryUInt64 } from '../reader'
import Connection from '../сonnection'

class IntColumn extends Column {
  intSize = 0
  unsigned = false
  async readItems (conn: Connection, count: number): Promise<(number | bigint)[]> {
    const res = []
    for (let _ = 0; _ < count; _++) {
      res.push(await this.readNumber(conn))
    }
    return res
  }

  async readNumber (conn: Connection): Promise<number | bigint> {
    return await readBinaryInt(conn.readStream, this.intSize, this.unsigned)
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

export class Int64Column extends IntColumn {
  intSize = 8
  static chType = 'Int64'
  async readNumber (conn: Connection): Promise<bigint> {
    return await readBinaryInt64(conn.readStream)
  }
}

export class UInt64Column extends Int64Column {
  unsigned = true
  static chType = 'UInt64'
  async readNumber (conn: Connection): Promise<bigint> {
    return await readBinaryUInt64(conn.readStream)
  }
}
