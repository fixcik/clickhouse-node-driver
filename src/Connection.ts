import { readBinaryString } from './reader'
import { writeVarint, readVarint } from './varint'
import { writeBinaryString } from './writer'
import { Socket } from 'net'
import { DBMS_DEFAULT_TIMEOUT_SEC, DBMS_DEFAULT_CONNECT_TIMEOUT_SEC } from './defines'
import BufferedStreamReader from './streams/BufferedStreamReader'
import BufferedStreamWriter from './streams/BufferedStreamWriter'
import HelloPacket from './protocol/packets/client/HelloClientPacket'
import { ServerPacketTypes } from './protocol/packets/ServerPacket'
import HelloServerPacket from './protocol/packets/server/HelloServerPacket'

export interface ConnectionOptions {
  host: string;
  port: number;
  user?: string;
  password?: string;
  database: string;
  connectionTimeout?: number;
  sendReceiveTimeout?: number;
}

interface ConnectionStreams {
  in: BufferedStreamReader;
  out: BufferedStreamWriter;
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
  socket!: Socket

  readStream!: BufferedStreamReader
  writeStream!: BufferedStreamWriter

  constructor ({ host, port, database, user = 'default', password = '', sendReceiveTimeout = DBMS_DEFAULT_TIMEOUT_SEC, connectionTimeout = DBMS_DEFAULT_CONNECT_TIMEOUT_SEC }: ConnectionOptions) {
    this.database = database
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.connectionTimeout = connectionTimeout
    this.sendReceiveTimeout = sendReceiveTimeout
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
    try {
      this._initConnection(this.host, this.port)
    } catch (e) {
      console.error(e)
    }
  }

  _initConnection (host: string, port: number): Promise<void> {
    const socket = this._createSocket(host, port)
    socket.setTimeout(this.sendReceiveTimeout)

    return new Promise((resolve, reject) => {
      socket.on('connect', async () => {
        this.connected = true

        this.readStream = new BufferedStreamReader()
        this.writeStream = new BufferedStreamWriter()

        this.readStream.on('error', (err) => {
          console.log(err)
        })

        this.writeStream.on('error', (err) => {
          console.error(err)
        })

        socket.pipe(this.readStream)
        // this.writeStream.pipe(socket)

        this._sendHello()
        this._readHello()
        resolve()
      })
      socket.on('error', err => {
        console.log(err)
        reject(err)
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

  _sendHello (): void {
    const packet = new HelloPacket({
      stream: this.socket,
      data: {
        clientName: 'ClickHouse node-driver',
        clientMajorVersion: 0,
        clientMinorVersion: 0,
        clientRevision: 1,
        database: this.database,
        user: this.user,
        password: this.password
      }
    })
    packet.write()
  }

  _readHello (): void {
    this.readStream.on('data', () => {
      const stream = this.readStream
      const packetType = readVarint(stream)
      console.log(packetType, 'pack')

      switch (packetType) {
        case ServerPacketTypes.HELLO: {
          const packet = new HelloServerPacket({ stream })
          packet.read()
          console.log(packet.data)
        }
      }
    })
  }

  ping (): boolean {
    return true
  }

  disconnect (): void {
  }
}
