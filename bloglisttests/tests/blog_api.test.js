const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const initialBlogs = [
    {
        title: 'Fullstack Open course experience',
        author: 'Juan Imsand',
        url: 'http:localhost:7000',
        likes:1,
    },
    {
        title: 'A day in my country',
        author: 'Marcos Perez',
        url: 'http:localhost:6006',
        likes: 10,
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        //.expect(response.body).toHaveLength(initialBlogs.length)
    expect(response.body).toHaveLength(initialBlogs.length)
})

test('the unique identifier of blogs is called id', async () => {
    const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    response.body.forEach(blog => expect(blog.id).toBeDefined())
})

test('creating a new blog with HTTP POST request', async () => {
    const newBlog = {
        title: 'The blog creation',
        author: 'The god of blogs',
        url: 'http:localhost:1234',
        likes: 33,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length + 1)
})

test('setting likes by default to zero', async () => {
    const newBlogWithoutLikes = {
        title: 'The blog creation',
        author: 'The god of blogs',
        url: 'http:localhost:1234',
    }

    const response = await api
                        .post('/api/blogs')
                        .send(newBlogWithoutLikes)
                        .expect(201)
    
    expect(response.body.likes).toEqual(0)
})

test('checking title and url properties before create a new blog HTTP POST', async () => {
    const newBlogWithoutTitleUrl = {
        author: 'The god of blogs',
        likes: 33,
    }

    const response = await api
                        .post('/api/blogs')
                        .send(newBlogWithoutTitleUrl)

    expect(response.status).toBe(400)
})

afterAll(() => {
    mongoose.connection.close()
})