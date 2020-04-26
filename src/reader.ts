import { readVarUint } from './varint'
import BufferedStreamReader from './BufferedStreamReader'

export const readBinaryBytesFixedLength = (stream: BufferedStreamReader, length: number): Promise<Buffer> => {
  return stream.read(length)
}

export const readBinaryStringFixedLength = async (stream: BufferedStreamReader, length: number): Promise<string> => {
  return (await readBinaryBytesFixedLength(stream, length)).toString('utf-8')
}

export const readBinaryString = async (stream: BufferedStreamReader): Promise<string> => {
  const length = await readVarUint(stream)
  return await readBinaryStringFixedLength(stream, length)
}

export const readBinaryInt = async (stream: BufferedStreamReader, size: number, unsigned = false): Promise<number> => {
  const buffer = await stream.read(size)
  return buffer[unsigned ? 'readUIntLE' : 'readIntLE'](0, size)
}

export const readBinaryInt32 = (stream: BufferedStreamReader): Promise<number> => {
  return readBinaryInt(stream, 4)
}

export const readBinaryUInt8 = (stream: BufferedStreamReader): Promise<number> => {
  return readBinaryInt(stream, 1, true)
}

/**
 *
def read_binary_int8(buf):
    return read_binary_int(buf, 'b')

def read_binary_int16(buf):
    return read_binary_int(buf, 'h')

def read_binary_int32(buf):
    return read_binary_int(buf, 'i')

def read_binary_int64(buf):
    return read_binary_int(buf, 'q')

def read_binary_uint8(buf):
    return read_binary_int(buf, 'B')

def read_binary_uint16(buf):
    return read_binary_int(buf, 'H')

def read_binary_uint32(buf):
    return read_binary_int(buf, 'I')

def read_binary_uint64(buf):
    return read_binary_int(buf, 'Q')

def read_binary_uint128(buf):
    hi = read_binary_int(buf, 'Q')
    lo = read_binary_int(buf, 'Q')

    return (hi << 64) + lo
 */
