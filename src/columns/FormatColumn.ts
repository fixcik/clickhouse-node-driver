import { NotImplementedError } from './../exceptions'
import Column from './Column'
export default class FormatColumn extends Column {
  pack (data: any) {
    throw new NotImplementedError()
  }

  unpack(buf: Buffer) {
    
  }

  _readData (items: any, buf: Buffer) {

  }
}
