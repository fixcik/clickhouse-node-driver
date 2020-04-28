import Client from './Client'

const conn = new Client({ host: 'localhost', port: 32770, database: 'default' })

conn.processOrdinaryQuery('SELECT 1').catch(e => {
  console.log(e)
})
// // writeVarint(1231, new Writable())
