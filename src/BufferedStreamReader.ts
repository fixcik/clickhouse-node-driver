import { Writable } from 'stream'

export default class BufferedStreamReader extends Writable {
  buffer!: Buffer
  size!: number
  position = 0
  readNext?: (error?: Error) => void

  _write (chunk: Buffer, _encoding: string, next: (error?: Error) => void): void {
    this.readNext = next
    console.log(`Received chank, length=${chunk.length}`)
    this.emit('data', chunk)
  }

  readBlock (): Promise<void> {
    if (this.readNext) {
      this.readNext()
    }
    console.log('Read block')
    return new Promise((resolve) => {
      this.on('data', (chunk: Buffer) => {
        this.buffer = chunk
        this.size = chunk.length
        if (chunk === null) {
          throw new Error('Unexpected EOF while reading bytes')
        }
        resolve()
      })
    })
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
        await this.readBlock()
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
    if (!this.buffer || this.position === this.size) {
      await this.readBlock()
      this.position = 0
    }
    return this.buffer[this.position++]
  }
}
