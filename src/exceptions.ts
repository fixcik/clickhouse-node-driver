import { ExceptionPacketData } from './protocol/packets/exception'

export class NotImplementedError extends Error {}
export class DbException extends Error {
  code: number
  stackTrace: string
  nested?: ExceptionPacketData
  constructor ({ message, name, code, stackTrace, nested }: ExceptionPacketData) {
    super(message.replace(`${name}: `, ''))
    this.name = name
    this.code = code
    this.stackTrace = stackTrace
    this.nested = nested
  }
}
