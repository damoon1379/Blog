const express = require('express');
const db = require('../pool')
const {marked} = require('marked')
const router = express.Router();
const createDomPurify = require('dompurify')
const {JSDOM} = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

router.get('/new',(req,res)=>{
    res.render('articles/new',{newArticle: {}})
})

router.get('/:id/edit',async(req,res)=>{
    const {rows} = await db.pool.query({
        text: 'SELECT * FROM newarticle WHERE id = $1',
        values: [req.params.id]
    }) 
    const newArticle = rows[0]
    res.render('articles/edit',{newArticle:newArticle})

})

router.get('/:slug',async(req,res)=>{
    const {rows} = await db.pool.query({
        text: 'SELECT * FROM newArticle WHERE slug = $1',
        values: [req.params.slug]
    })
    const newArticle = rows[0]
    if(newArticle == null) res.redirect('/')
res.render('articles/show',{newArticle: newArticle})
})

router.post('/',async(req,res)=>{
try{
    await db.pool.query({
        text:'INSERT INTO newArticle (title,description,markdown) VALUES ($1,$2,$3)',
        values:[req.body.title,req.body.description,req.body.markdown]
    })
    const {rows} = await db.pool.query({
        text: 'SELECT * FROM newArticle WHERE title = $1 ',
        values:[req.body.title]
    })
    const newArticle = rows[0]
    const sanitized = dompurify.sanitize(marked(newArticle.markdown))
    //console.log(sanitized)
    await db.pool.query({
        text: 'UPDATE newarticle SET sanitizedHtml = $1 WHERE id= $2',
        values:[sanitized ,newArticle.id]
    })
    res.redirect(`/articles/${newArticle.slug}`)

}catch(error){
    console.log(error)
res.render('articles/new',{newArticle: newArticle})
}

})

router.delete('/:id',async(req,res)=>{
    await db.pool.query({
        text:'DELETE FROM newarticle WHERE id= $1',
        values: [req.params.id]
    })
    res.redirect('/')
})

router.put('/:id',async(req,res)=>{
    try{
        
        const sanitized = dompurify.sanitize(marked(req.body.markdown))

        await db.pool.query({
            text: 'UPDATE newarticle SET title=$1, description=$2, markdown=$3,sanitizedhtml=$4 WHERE id=$5',
            values: [req.body.title,req.body.description,req.body.markdown,sanitized,req.params.id]
        })
        res.redirect('/');
    }catch(error){
        console.log(error)
        const {rows} = await db.pool.query({
            text: 'SELECT * FROM newarticle WHERE id = $1',
            values: [req.params.id]
        })
        const preArticle = rows[0]

        res.render('articles/edit',{newArticle:preArticle})
    }
})

module.exports=router;