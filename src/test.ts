import { Writable } from 'stream'
// import { writeVarint } from './varint'
import Connection from './Connection'

const conn = new Connection({ host: '127.0.0.1', port: 32770, database: 'magnit_data' })

conn.forceConnection()

// writeVarint(1231, new Writable())
