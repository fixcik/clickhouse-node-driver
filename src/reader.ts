import { readVarint } from './varint'
export const readBinaryString = (stream: NodeJS.ReadableStream): string => {
  const length = readVarint(stream)
  console.error(length, 'length')
  return ''
}
