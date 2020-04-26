import { Socket } from 'net'
import * as defines from './defines'
import BufferedStreamReader from './BufferedStreamReader'
import HelloClientPacket from './protocol/packets/client/HelloClientPacket'
import HelloServerPacket, { HelloServerPacketData } from './protocol/packets/server/HelloServerPacket'
import ExceptionPacket from './protocol/packets/server/ExceptionPacket'
import ServerPacket, { ServerPacketTypes } from './protocol/packets/ServerPacket'
import { readVarUint } from './varint'
import QueryPacket from './protocol/packets/client/QueryPacket'

export interface ConnectionOptions {
  host: string;
  port: number;
  user?: string;
  password?: string;
  database: string;
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
  constructor ({ serverName, serverVersionMajor, serverVersionMinor, serverVersionPatch, serverRevision, serverTimezone, serverDisplayName }: HelloServerPacketData) {
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

  constructor ({ host, port, database, user = 'default', password = '', sendReceiveTimeout = defines.DBMS_DEFAULT_TIMEOUT_SEC, connectionTimeout = defines.DBMS_DEFAULT_CONNECT_TIMEOUT_SEC, clientName = defines.CLIENT_NAME }: ConnectionOptions) {
    this.database = database
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.connectionTimeout = connectionTimeout
    this.sendReceiveTimeout = sendReceiveTimeout
    this.clientName = `${defines.DBMS_NAME} ${clientName}`
  }

  forceConnection (): void {
    if (!this.connected) {
      this.connect()
    } else if (!this.ping()) {
      this.connect()
    }
  }

  connect (): void{
    if (this.connected) {
      this.disconnect()
    }

    this._initConnection(this.host, this.port)
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

  sendQuery (query: string, queryId?: string): void {
    if (!this.connected) {
      this.connect()
    }
    const packet = new QueryPacket(this, {
      query,
      queryId
    })
    packet.write()
  }
}
