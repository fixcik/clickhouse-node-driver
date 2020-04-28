import { writeVarint } from './varint'

export const writeBinaryBytes = (buff: Buffer, stream: NodeJS.WritableStream): void => {
  writeVarint(buff.length, stream)
  if (buff.length > 0) {
    stream.write(buff)
  }
}

export const writeBinaryString = (text: string, stream: NodeJS.WritableStream): void => {
  console.log(`write binary string '${text}'`)
  const buff = Buffer.from(text, 'utf-8')
  writeBinaryBytes(buff, stream)
}

const packInt = (number: number, size: number, unsigned = false): Buffer => {
  const buff = Buffer.alloc(size)
  buff[unsigned ? 'writeUIntLE' : 'writeIntLE'](number, 0, size)
  return buff
}

export const writeBinaryUInt8 = (number: number, stream: NodeJS.WritableStream): void => {
  console.log('uint8', packInt(number, 1, true))
  stream.write(packInt(number, 1, true))
}

export const writeBinaryInt32 = (number: number, stream: NodeJS.WritableStream): void => {
  stream.write(packInt(number, 4))
}
