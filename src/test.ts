import { Writable } from 'stream'
// import { writeVarint } from './varint'
import Connection from './Connection'

const conn = new Connection({ host: 'magnit-dmp.local', port: 9033, database: 'default' })

try {
  conn.forceConnection()
} catch (e) {
  console.error(e.staskTrace)
  console.error(e)
}
// writeVarint(1231, new Writable())
