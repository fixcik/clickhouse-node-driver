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

  async _readData (conn: Connection, count: number): Promise<unknown[]> {
    if (!count) {
      return []
    }
    let dataSize = BigInt(count)
    const queue = [{ column: new ArrayColumn(this), size: dataSize, depth: 0 }]
    const sliceSeries = []

    let curDepth = 0
    let prevOffset = BigInt('0')
    let slices = []
    let nested: Column = this.nested

    while (true) {
      const task = queue.shift()
      if (!task) {
        break
      }
      const { column, size, depth } = task
      nested = column.nested

      if (curDepth !== depth) {
        curDepth = depth
        sliceSeries.push(slices)
        prevOffset = BigInt('0')
        slices = []
      }

      if (nested instanceof ArrayColumn) {
        for (let i = BigInt('0'); i < size; i++) {
          const offset = await readBinaryUInt64(conn.readStream)
          dataSize = offset
          queue.push({
            column: nested,
            size: offset - prevOffset,
            depth: depth + 1
          })
          slices.push([prevOffset, offset])
          prevOffset = offset
        }
      } else {
        prevOffset += size
      }
    }

    let data = await nested.readData(conn, Number(dataSize))

    for (const slices of sliceSeries.reverse()) {
      const nestedData = []
      for (const [start, end] of slices) {
        nestedData.push(data.slice(Number(start), Number(end)))
      }
      data = nestedData
    }

    return data
  }
}
