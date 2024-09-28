const {Pool}=require('pg')

const pool = new Pool({
    host:'localhost',
    user:'postgres',
    password:2670,
    port:5432,
    database:'blog_api'
})

module.exports={
    pool,
}