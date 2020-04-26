
export enum Compression {
  DISABLED,
  ENABLED
}

export enum CompressionMethod {
  LZ4 = 1,
  LZ4HC = 2,
  ZSTD = 3
}

export enum CompressionMethodByte {
  LZ4 = 0x82,
  ZSTD = 0x90
}
