import { Socket } from 'net'
import * as defines from './defines'
import { BufferedReader, BufferedSocketReader } from './buffered_reader'
import HelloClientPacket from './protocol/outgoing/HelloClientPacket'
import HelloServerPacket, { HelloServerPacketData } from './protocol/incoming/HelloServerPacket'
import ExceptionPacket from './protocol/incoming/ExceptionPacket'
import { readVarUint } from './varint'
import QueryPacket from './protocol/outgoing/QueryPacket'
import { Compression, ServerPacketTypes } from './protocol/enums'
import DataClientPacket from './protocol/outgoing/DataClientPacket'
import DataServerPacket from './protocol/incoming/DataServerPacket'
import ProfileInfoPacket from './protocol/incoming/ProfileInfoPacket'
import ProgressServerPacket from './protocol/incoming/ProgressServerPacket'
import { ServerPacket } from './protocol/packet'
import { RowOrientedBlock } from './block'

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

  readStream!: BufferedReader
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
        this.readStream = new BufferedSocketReader(socket, defines.BUFFER_SIZE)

        try {
          this._sendHello()
          await this._readHello()
          console.log('connected')
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
      case ServerPacketTypes.DATA:
        packet = new DataServerPacket(this)
        break
      case ServerPacketTypes.PROFILE_INFO:
        packet = new ProfileInfoPacket(this)
        break
      case ServerPacketTypes.PROGRESS:
        packet = new ProgressServerPacket(this)
        break
      default:
        throw new Error(`Unknown packet type ${packetType}`)
    }
    await packet.read()
    console.log(packet.getData())
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
    const packet = new DataClientPacket(this, {
      block,
      tableName
    })
    packet.write()
  }

  sendExternalTables (tables = []): void {
    // TODO: finish send external block
    // for (const table of tables) {
    //   this.sendData(new RowOrientedBlock(this, table.data))
    // }
    this.sendData(new RowOrientedBlock())
  }

  async sendQuery (query: string, queryId?: string): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }
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
