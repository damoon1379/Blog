const express = require('express');

const articleRouter = require('./routes/article')
const app = express();
const db = require('./pool')
const methodOverride = require('method-override')
app.use(express.urlencoded({extended:true}))

app.set('view engine','ejs')
app.use(methodOverride('_method'))

app.get('/',async(req,res)=>{
    const {rows} = await db.pool.query('SELECT * FROM newArticle ORDER BY createdat DESC')
    res.render('articles/index',{articles:rows})
})

app.use('/articles',articleRouter)


app.listen(5000,()=>console.log('listening on port 5000'));