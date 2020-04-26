import { Transform, TransformCallback } from 'stream'

export default class BufferedStreamWriter extends Transform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _transform (chunk: any, encoding: string, callback: TransformCallback): void {
    console.log(chunk)
    callback(chunk)
  }
}
