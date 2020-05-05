import Client from './client'

// const conn = new Client({ host: '127.0.0.1', port: 32770, database: 'default' })
const conn = new Client({ host: 'magnit-dmp.local', port: 9033, database: 'default' })

conn.processOrdinaryQuery("SELECT toInt64(n), [n, NULL, 'asd', 'asdas'] FROM (SELECT 1) ARRAY JOIN ['1','2','3'] as n").then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})
