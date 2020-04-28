import { Socket } from 'net'
import * as defines from './defines'
import BufferedStreamReader from './BufferedStreamReader'
import HelloClientPacket from './protocol/packets/client/HelloClientPacket'
import HelloServerPacket, { HelloServerPacketData } from './protocol/packets/server/HelloServerPacket'
import ExceptionPacket from './protocol/packets/server/ExceptionPacket'
import ServerPacket, { ServerPacketTypes } from './protocol/packets/ServerPacket'
import { readVarUint } from './varint'
import QueryPacket from './protocol/packets/client/QueryPacket'
import { Compression } from './protocol'
import BaseBlock from './block/BaseBlock'
import RowOrientedBlock from './block/RowOrientedBlock'
import DataPacket from './protocol/packets/client/DataPacket'

export interface ConnectionOptions {
  host: string;
  port: number;
  user?: string;
  password?: string;
  database: string;
  compression?: boolean;
  connectionTimeout?: number;
  sendReceiveTimeout?: number;
  clientName?: string;
}

class ServerInfo {
  name: string;
  versionMajor: number;
  versionMinor: number;
  versionPatch?: number;
  revision: number;
  timezone?: string;
  displayName?: string;
  constructor ({
    serverName, serverVersionMajor, serverVersionMinor,
    serverVersionPatch, serverRevision, serverTimezone,
    serverDisplayName
  }: HelloServerPacketData) {
    this.name = serverName
    this.versionMajor = serverVersionMajor
    this.versionMinor = serverVersionMinor
    this.versionPatch = serverVersionPatch
    this.revision = serverRevision
    this.timezone = serverTimezone
    this.displayName = serverDisplayName
  }
}

export default class Connection {
  database: string
  connected = false
  host: string
  port: number
  user: string
  password: string
  connectionTimeout: number
  sendReceiveTimeout: number
  clientName: string
  socket!: Socket

  readStream!: BufferedStreamReader
  serverInfo!: ServerInfo

  compression: Compression

  constructor ({
    host, port, database,
    user = 'default', password = '',
    sendReceiveTimeout = defines.DBMS_DEFAULT_TIMEOUT_SEC,
    connectionTimeout = defines.DBMS_DEFAULT_CONNECT_TIMEOUT_SEC,
    clientName = defines.CLIENT_NAME,
    compression = false
  }: ConnectionOptions) {
    this.database = database
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.connectionTimeout = connectionTimeout
    this.sendReceiveTimeout = sendReceiveTimeout
    this.clientName = `${defines.DBMS_NAME} ${clientName}`

    if (compression) {
      throw new Error('Compression not awailable')
    } else {
      this.compression = Compression.DISABLED
    }
  }

  forceConnection (): void {
    if (!this.connected) {
      this.connect()
    } else if (!this.ping()) {
      this.connect()
    }
  }

  async connect (): Promise<void> {
    if (this.connected) {
      this.disconnect()
    }

    await this._initConnection(this.host, this.port)
  }

  async _initConnection (host: string, port: number): Promise<void> {
    const socket = this._createSocket(host, port)
    socket.setTimeout(this.sendReceiveTimeout)

    return new Promise((resolve, reject) => {
      socket.on('connect', async () => {
        this.connected = true

        this.readStream = new BufferedStreamReader()
        socket.pipe(this.readStream)

        try {
          this._sendHello()
          await this._readHello()
          resolve()
        } catch (e) {
          reject(e)
        }
      })
      socket.on('close', () => {
        this.connected = false
      })
    })
  }

  _createSocket (host: string, port: number): Socket {
    this.socket = new Socket({ readable: true, writable: true })
    this.socket.connect({ host, port })
    this.socket.setNoDelay(true)
    return this.socket
  }

  async readPacket (): Promise<ServerPacket<unknown>> {
    const packetType = await readVarUint(this.readStream)
    let packet
    switch (packetType) {
      case ServerPacketTypes.HELLO:
        packet = new HelloServerPacket(this)
        break
      case ServerPacketTypes.EXCEPTION:
        packet = new ExceptionPacket(this)
        break
      default:
        throw new Error('Unknown packet type')
    }
    await packet.read()
    return packet
  }

  _sendHello (): void {
    const packet = new HelloClientPacket(
      this,
      {
        clientName: this.clientName,
        clientMajorVersion: defines.CLIENT_VERSION_MAJOR,
        clientMinorVersion: defines.CLIENT_VERSION_MINOR,
        clientRevision: defines.CLIENT_REVISION,
        database: this.database,
        user: this.user,
        password: this.password
      }
    )
    packet.write()
  }

  async _readHello (): Promise<void> {
    const packet = await this.readPacket()

    if (packet instanceof HelloServerPacket) {
      this.serverInfo = new ServerInfo(packet.getData())
    } else if (packet instanceof ExceptionPacket) {
      console.log('error...')
      throw packet.getException()
    } else {
      this.disconnect()
    }
  }

  ping (): boolean {
    return true
  }

  disconnect (): void {
    // Do smth
  }

  sendData (block: RowOrientedBlock, tableName = ''): void {
    const packet = new DataPacket(this, {
      block,
      tableName
    })
    packet.write()
  }

  sendExternalTables (tables = []): void {
    for (const table of tables) {
      // TODO: finish send external block
      // this.sendData(new RowOrientedBlock(this, table.data))
    }
    this.sendData(new RowOrientedBlock())
  }

  async sendQuery (query: string, queryId?: string): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }
    console.log(this.serverInfo)
    const packet = new QueryPacket(this, {
      query,
      queryId
    })

    // // @ts-ignore
    // this.socket.write = (buffer: string | Uint8Array, cb?: ((err?: Error | undefined) => void | undefined)): boolean => {
    //   console.log('----> ', buffer)
    //   return true
    // }
    packet.write()
    console.debug('Send query: ', query)
  }
}