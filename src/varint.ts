export const writeVarint = (value: number, stream: NodeJS.WritableStream): void => {
  value |= 0
  const result = []
  while (true) {
    const byte = value & 0x7f
    value >>= 7
    if (
      (value === 0 && (byte & 0x40) === 0) ||
      (value === -1 && (byte & 0x40) !== 0)
    ) {
      result.push(byte)
      break
    }
    result.push(byte | 0x80)
  }
  stream.write(Buffer.from(result))
}

export const readVarint = (stream: NodeJS.ReadableStream): number => {
  let result = 0
  let shift = 0
  console.log('readvarint')
  while (true) {
    const byte = stream.read()
    console.log(byte, 'asdasd')

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    result |= (byte & 0x7f) << shift
    shift += 7
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (byte < 0x80) {
      break
    }
  }
  return result
}
