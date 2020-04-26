import { ServerPacketTypes } from './../protocol/packets/ServerPacket'
import { Writable } from 'stream'
import ServerPacket from '../protocol/packets/ServerPacket'
import { readVarUint } from '../varint'
import HelloServerPacket from '../protocol/packets/server/HelloServerPacket'
import ExceptionPacket from '../protocol/packets/server/ExceptionPacket'

export default class BufferedStreamReader extends Writable {
  buffer!: Buffer
  size!: number
  position = 0
  readNext?: (error?: Error) => void

  _write (chunk: Buffer, _encoding: string, next: (error?: Error) => void): void {
    this.readNext = next
    this.emit('data', chunk)
  }

  readBlock (): Promise<void> {
    if (this.readNext) {
      this.readNext()
    }
    return new Promise((resolve) => {
      this.once('data', (chunk: Buffer) => {
        this.buffer = chunk
        this.size = chunk.length
        if (chunk === null) {
          throw new Error('Unexpected EOF while reading bytes')
        }
        resolve()
      })
    })
  }

  async readPacket (): Promise<ServerPacket<unknown>> {
    const packetType = await readVarUint(this)
    let packet
    switch (packetType) {
      case ServerPacketTypes.HELLO:
        packet = new HelloServerPacket(this)
        break
      case ServerPacketTypes.EXCEPTION:
        packet = new ExceptionPacket(this)
        break
      default:
        throw new Error('Unknown packet type')
    }
    await packet.read()
    return packet
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
