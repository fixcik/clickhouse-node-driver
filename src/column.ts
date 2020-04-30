import { ColumntInfo } from './typings'
import Column from './columns/_column'
import Connection from './сonnection'
import { UInt8Column, UInt16Column, UInt32Column } from './columns/int'

const columns = [UInt8Column, UInt16Column, UInt32Column]
const columnByType: {
  [key: string]: typeof Column;
} = {}
for (const column of columns) {
  columnByType[column.chType] = column
}

export const getColumnByInfo = ({ type }: ColumntInfo): Column => {
  if (type in columnByType) {
    return new columnByType[type]()
  } else {
    throw new Error(`Unknown type "${type}"`)
  }
}

export const readColumn = (conn: Connection, info: ColumntInfo, count: number): Promise<unknown[]> => {
  const column = getColumnByInfo(info)
  return column.readData(conn, count)
}
