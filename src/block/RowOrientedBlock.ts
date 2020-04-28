import BaseBlock from './BaseBlock'

export default class RowOrientedBlock extends BaseBlock {
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
