import { readVarUint } from './varint'
import { BufferedReader } from './buffered_reader'
import * as defines from './defines'

export const readBinaryBytesFixedLength = (stream: BufferedReader, length: number): Promise<Buffer> => {
  return stream.read(length)
}

export const readBinaryStringFixedLength = async (stream: BufferedReader, length: number): Promise<Buffer> => {
  return (await readBinaryBytesFixedLength(stream, length))
}

export const readBinaryString = async (stream: BufferedReader): Promise<string> => {
  const length = await readVarUint(stream)
  return (await readBinaryStringFixedLength(stream, length)).toString(defines.STRINGS_ENCODING)
}

export const readBinaryInt = async (stream: BufferedReader, size: number, unsigned = false): Promise<number> => {
  const buffer = await stream.read(size)
  return buffer[unsigned ? 'readUIntLE' : 'readIntLE'](0, size)
}

export const readBinaryUInt8 = (stream: BufferedReader): Promise<number> => {
  return readBinaryInt(stream, 1, true)
}

export const readBinaryUInt16 = (stream: BufferedReader): Promise<number> => {
  return readBinaryInt(stream, 2, true)
}

export const readBinaryUInt32 = (stream: BufferedReader): Promise<number> => {
  return readBinaryInt(stream, 2, true)
}

export const readBinaryInt16 = (stream: BufferedReader): Promise<number> => {
  return readBinaryInt(stream, 2)
}

export const readBinaryInt32 = (stream: BufferedReader): Promise<number> => {
  return readBinaryInt(stream, 4)
}

export const readBinaryUInt64 = async (stream: BufferedReader): Promise<bigint> => {
  const buffer = await stream.read(8)
  return buffer.readBigInt64LE()
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
