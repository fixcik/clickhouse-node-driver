import { writeVarint } from './varint'

export const writeBinaryBytes = (buff: Buffer, stream: NodeJS.WritableStream): void => {
  writeVarint(buff.length, stream)
  stream.write(buff)
}

export const writeBinaryString = (text: string, stream: NodeJS.WritableStream): void => {
  const buff = Buffer.from(text, 'utf-8')
  writeBinaryBytes(buff, stream)
}
