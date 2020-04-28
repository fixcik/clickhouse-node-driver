
export enum ClientPacketTypes {
  HELLO,
  QUERY,
  DATA,
  CANCEL,
  PING,
  TABLES_STATUS_REQUEST
}

export enum ServerPacketTypes {
  HELLO,
  DATA,
  EXCEPTION,
  PROGRESS,
  PONG,
  END_OF_STREAM,
  PROFILE_INFO,
  TOTALS,
  EXTREMES,
  TABLES_STATUS_RESPONSE,
  LOG,
  TABLE_COLUMNS
}
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
