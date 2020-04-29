
export enum ClientPacketTypes {
  HELLO = 0,
  QUERY = 1,
  DATA = 2,
  CANCEL = 3,
  PING = 4,
  TABLES_STATUS_REQUEST = 5
}

export enum ServerPacketTypes {
  HELLO = 0,
  DATA = 1,
  EXCEPTION = 2,
  PROGRESS = 3,
  PONG = 4,
  END_OF_STREAM = 5,
  PROFILE_INFO = 6,
  TOTALS = 7,
  EXTREMES = 8,
  TABLES_STATUS_RESPONSE = 9,
  LOG = 10,
  TABLE_COLUMNS = 11
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
