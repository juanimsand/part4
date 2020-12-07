const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
/*
const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}
*/
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name:1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const titleMissing = request.body.hasOwnProperty('title')
    const urlMissing = request.body.hasOwnProperty('url')
    const token = request.token
    //const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    if ((!titleMissing) && (!urlMissing)) {
        response.status(400).json(request.body)
    }
    else {
        let blog = new Blog(request.body)
        if (!request.body.hasOwnProperty('likes')) {
            blog.likes = 0
        }
        //const userLinkedToBlog = await User.findOne()
        //blog.user = userLinkedToBlog._id
        blog.user = user._id
        const blogSaved = await blog.save()
        //userLinkedToBlog.blogs = userLinkedToBlog.blogs.concat([blogSaved._id])
        user.blogs = user.blogs.concat([blogSaved._id])
        //await userLinkedToBlog.save()
        await user.save()
        response.status(201).json(blog)
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    console.log(blog.user.toString())
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    console.log(user.id.toString())
    if (blog.user.toString() === user.id.toString())
        await Blog.findByIdAndRemove(request.params.id)
    //await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const blog = {
        likes: body.likes
    }

    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

    response.status(200).end()
})

module.exports = blogsRouter