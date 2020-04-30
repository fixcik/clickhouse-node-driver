import Client from './client'

const conn = new Client({ host: 'magnit-dmp.local', port: 9033, database: 'default' })

conn.processOrdinaryQuery('SELECT if(n%2=0, 1, 0) FROM (SELECT 100 as count) ARRAY JOIN range(count) as n').then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})
// conn.processOrdinaryQuery('SELECT if(n%1=0, 1, 0) as c FROM (SELECT 100 as count) ARRAY JOIN range(count) as n').catch(e => {
//   console.log(e)
// })
// // writeVarint(1231, new Writable())
