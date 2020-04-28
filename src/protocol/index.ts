export enum QueryProcessingStage {
    FETCH_COLUMNS = 0,
    WITH_MERGEABLE_STATE = 1,
    COMPLETE = 2
}

export enum Compression {
  DISABLED = 0,
  ENABLED = 1
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
