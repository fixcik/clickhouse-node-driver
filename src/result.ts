import { ColumntInfo } from './typings'
import { DataServerPacket } from './protocol/packets/data'

export interface QueryResultOptions {
    packetGenerator: AsyncIterable<DataServerPacket>;
    columnar: boolean;
    withColumns: boolean;
}

export class QueryResult {
    packetGenerator: AsyncIterable<DataServerPacket>
    data: unknown[] = []
    withColumns: boolean
    columns: ColumntInfo[] = []
    columnar: boolean
    constructor ({ packetGenerator, columnar, withColumns }: QueryResultOptions) {
      this.packetGenerator = packetGenerator
      this.withColumns = withColumns
      this.columnar = columnar
    }

    store (packet: DataServerPacket): void {
      const block = packet.getBlock()
      if (!block) {
        return
      }
      if (block.rowCount) {
        if (this.columnar) {

        } else {
          this.data.push(...block.getRows())
        }
      }
    }

    async getResult (): Promise<unknown[]> {
      for await (const packet of this.packetGenerator) {
        this.store(packet)
      }
      return this.data
    }
}
