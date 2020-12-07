const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    //let blog = new Blog()
    const titleMissing = request.body.hasOwnProperty('title')
    const urlMissing = request.body.hasOwnProperty('url')
    if ((!titleMissing) && (!urlMissing)) {
        console.log('Here!')
        response.status(400).json(request.body)
    }
    else {
        let blog = new Blog()
        if (!request.body.hasOwnProperty('likes')) {
            blog = new Blog(request.body)
            blog.likes = 0
        }
        else {
            blog = new Blog(request.body)
        }

        await blog.save()
        response.status(201).json(blog)
    }
})

module.exports = blogsRouter