import { NotImplementedError } from '../exceptions'

export interface ColumntInfo {
  name: string;
  type: string;
}
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

export default class BaseBlock {
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
