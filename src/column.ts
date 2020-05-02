import { ColumntInfo } from './typings'
import Column from './columns/column'
import Connection from './сonnection'
import { UInt8Column, UInt16Column, UInt32Column } from './columns/int'
import { StringColumn, createFixedStringColumn } from './columns/string'

const columns = [
  UInt8Column, UInt16Column, UInt32Column,
  StringColumn
]
const columnByType: {
  [key: string]: typeof Column;
} = {}
for (const column of columns) {
  columnByType[column.chType] = column
}

export const getColumnByType = (type: string): Column => {
  if (type.startsWith('FixedString')) {
    return createFixedStringColumn(type)
  }
  if (type.startsWith('Nullable')) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getNullableColumn(type)
  }
  if (type in columnByType) {
    return new columnByType[type]()
  } else {
    throw new Error(`Unknown type "${type}"`)
  }
}

export const getNullableColumn = (type: string): Column => {
  type = type.slice(9, -1)
  const column = getColumnByType(type)
  column.nullable = true
  return column
}

export const getColumnByInfo = ({ type }: ColumntInfo): Column => {
  return getColumnByType(type)
}

export const readColumn = (conn: Connection, info: ColumntInfo, count: number): Promise<unknown[]> => {
  const column = getColumnByInfo(info)
  return column.readData(conn, count)
}
