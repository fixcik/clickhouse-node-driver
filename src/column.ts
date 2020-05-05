/* eslint-disable @typescript-eslint/no-use-before-define */
import { ColumntInfo } from './typings'
import Column from './columns/column'
import Connection from './сonnection'
import { UInt8Column, UInt16Column, UInt32Column } from './columns/int'
import { StringColumn, FixedStringColumn } from './columns/string'
import { ArrayColumn } from './columns/array'

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

export const createColumnByType = (type: string): Column => {
  if (type.startsWith('Array')) {
    return createArrayColumn(type)
  }
  if (type.startsWith('FixedString')) {
    return createFixedStringColumn(type)
  }
  if (type.startsWith('Nullable')) {
    return createNullableColumn(type)
  }
  if (type in columnByType) {
    return new columnByType[type]()
  } else {
    throw new Error(`Unknown type "${type}"`)
  }
}

export const createFixedStringColumn = (type: string): FixedStringColumn => {
  const length = Number(type.slice(12, -1))
  return new FixedStringColumn(length)
}

export const createArrayColumn = (type: string): Column => {
  type = type.slice(6, -1)
  return new ArrayColumn(createColumnByType(type))
}

export const createNullableColumn = (type: string): Column => {
  type = type.slice(9, -1)
  const column = createColumnByType(type)
  column.nullable = true
  return column
}

export const createColumnByInfo = ({ type }: ColumntInfo): Column => {
  return createColumnByType(type)
}

export const readColumn = (conn: Connection, info: ColumntInfo, count: number): Promise<unknown[]> => {
  const column = createColumnByInfo(info)
  return column.readData(conn, count)
}
