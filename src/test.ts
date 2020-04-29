import Client from './Client'

const conn = new Client({ host: 'localhost', port: 32770, database: 'default' })

conn.processOrdinaryQuery('SELECT if(n%2=0, 1, 0) as c, n FROM (SELECT 10000000 as count) ARRAY JOIN range(count) as n').catch(e => {
  console.log(e)
})
// conn.processOrdinaryQuery('SELECT if(n%1=0, 1, 0) as c FROM (SELECT 10000 as count) ARRAY JOIN range(count) as n').catch(e => {
//   console.log(e)
// })
// // writeVarint(1231, new Writable())
