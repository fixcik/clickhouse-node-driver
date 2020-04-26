import FormatColumn from './FormatColumn'

class IntColumn extends FormatColumn {
  intSize = 0
}

class UIntColumn extends IntColumn {

}

export class UInt8Column extends UIntColumn {
  chType = 'UInt8'
  intSize = 1

  pack (data: number) {
    buf.writeUInt8(data, pos)
  }
}
