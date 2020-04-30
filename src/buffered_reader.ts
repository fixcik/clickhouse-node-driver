import { Socket } from 'net'
import { NotImplementedError } from './exceptions'

export class BufferedReader {
  buffer!: Buffer
  size = 0
  position = 0
  buffSize: number

  constructor (buffSize: number) {
    this.buffSize = buffSize
  }

  readBlock (size: number): Promise<void> {
    throw new NotImplementedError()
  }

  async read (unread: number): Promise<Buffer> {
    const nextPos = this.position + unread
    if (nextPos < this.size) {
      const result = this.buffer.slice(this.position, nextPos)
      this.position = nextPos
      return result
    }

    let buffer = this.buffer
    let position = this.position
    let size = this.size
    const result = []

    while (unread > 0) {
      if (position === size) {
        await this.readBlock(unread)
        position = 0
        buffer = this.buffer
        size = buffer.length
      }
      const end = Math.min(unread, size)
      result.push(buffer.slice(position, position + end))
      position += end
      unread -= end
    }

    this.position = position
    this.size = size

    return Buffer.concat(result)
  }

  async readOne (): Promise<number> {
    if (this.position === this.size) {
      await this.readBlock(1)
      this.position = 0
    }
    return this.buffer[this.position++]
  }
}

export class BufferedSocketReader extends BufferedReader {
  socket: Socket

  constructor (socket: Socket, buffSize: number) {
    super(buffSize)
    this.socket = socket
  }

  readBlock (size: number): Promise<void> {
    this.socket.resume()
    return new Promise((resolve, reject) => {
      this.socket.once('readable', () => {
        this.buffer = this.socket.read(Math.min(this.buffSize, size, this.socket.readableLength))

        if (this.buffer !== null) {
          this.size = this.buffer.length
          this.socket.pause()
          resolve()
        } else {
          reject(new Error('Unexpected EOF while reading bytes'))
        }
      })
    })
  }
}
