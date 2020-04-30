import { ColumntInfo } from './typings'
import { NotImplementedError } from './exceptions'

export interface BaseBlockOptions {
  data?: unknown[][];
  columns?: ColumntInfo[];
  info?: BlockInfo;
}

export class BlockInfo {
  isOverflows: boolean;
  bucketNum: number;

  constructor ({ isOverflows = false, bucketNum = -1 } = {}) {
    this.isOverflows = isOverflows
    this.bucketNum = bucketNum
  }
}

export class BaseBlock {
  columns: ColumntInfo[]
  data: unknown[][]
  info: BlockInfo
  constructor ({ data = [], columns = [], info = new BlockInfo() }: BaseBlockOptions = {}) {
    this.columns = columns
    this.data = this.normalize(data)
    this.info = info
  }

  normalize (data: unknown[][]): unknown[][] {
    return data
  }

  get colCount (): number {
    throw new NotImplementedError()
  }

  get rowCount (): number {
    throw new NotImplementedError()
  }

  getColumns (): string[] {
    throw new NotImplementedError()
  }

  getRows (): object[] {
    throw new NotImplementedError()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getColumnByIndex (index: number): unknown[] {
    throw new NotImplementedError()
  }
}

export class ColumnOrientedBlock extends BaseBlock {

}

export class RowOrientedBlock extends BaseBlock {
  get rowCount (): number {
    return this.data.length
  }

  get colCount (): number {
    return 0 in this.data ? Object.values(this.data[0]).length : 0
  }

  getColumnByIndex (index: number): unknown[] {
    return this.data.map(row => {
      if (index in row) {
        return row[index]
      } else {
        throw new Error(`No value with index=${index}`)
      }
    })
  }
}
