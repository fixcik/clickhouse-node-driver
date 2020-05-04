import Client from './client'

const conn = new Client({ host: '127.0.0.1', port: 32770, database: 'default' })
// const conn = new Client({ host: 'magnit-dmp.local', port: 9033, database: 'default' })

conn.processOrdinaryQuery("SELECT ['asd', 'asdas']").then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})
