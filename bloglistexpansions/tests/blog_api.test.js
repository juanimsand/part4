const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'Fullstack Open course experience',
        author: 'Juan Imsand',
        url: 'http:localhost:7000',
        likes: 1,
    },
    {
        title: 'A day in my country',
        author: 'Marcos Perez',
        url: 'http:localhost:6006',
        likes: 10,
    },
]

beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secreta', 10)
    const user = new User({ username: 'raiz', name: 'Nombre Raiz', passwordHash })
    const userSaved = await user.save()    
        
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()

})

// define a function that login with raiz user
const tokenAfeterLogin = async (user) => {
    const response = await api
        .post('/api/login')
        .send(user)
    console.log(response.body)
    return response.body.token
}

describe('1 Blogs management', () => {
    
    test('1.1 Blogs are returned as json', async () => {
        const response = await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        console.log(response.body)
        expect(response.body).toHaveLength(initialBlogs.length)
    })

    test('1.2 The unique identifier of blogs is called id', async () => {
        const response = await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        response.body.forEach(blog => expect(blog.id).toBeDefined())
    })

    test('1.3 creating a new blog with HTTP POST request', async () => {
        const newBlog = {
            title: 'The blog creation',
            author: 'The god of blogs',
            url: 'http:localhost:1234',
            likes: 33,
        }

        const userForLogin = {
            username: 'raiz',
            password: 'secreta'
        }
        let bearerString = 'bearer '
        const token = await tokenAfeterLogin(userForLogin)
        console.log(token)
        if (!token.toLowerCase().startsWith('bearer '))
            bearerString = bearerString.concat(token)
        else
            bearerString = token
        console.log('bearerString', bearerString)
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('authorization', bearerString)
            .expect(201)

        const userResponse = await api.get('/api/users')
        console.log('usuarios: ', userResponse.body)

        const response = await api.get('/api/blogs')
        console.log(response.body)
        expect(response.body).toHaveLength(initialBlogs.length + 1)
    })

    test('1.4 Creating a new blog with HTTP POST request but without a provided token', async () => {
        const newBlog = {
            title: 'The blog creation',
            author: 'The god of blogs',
            url: 'http:localhost:1234',
            likes: 33,
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)

        expect(response.status).toBe(401)
    })

    test('1.5 Setting likes by default to zero', async () => {
        const newBlogWithoutLikes = {
            title: 'The blog creation',
            author: 'The god of blogs',
            url: 'http:localhost:1234',
        }

        const userForLogin = {
            username: 'raiz',
            password: 'secreta'
        }
        let bearerString = 'bearer '
        const token = await tokenAfeterLogin(userForLogin)
        console.log(token)
        if (!token.toLowerCase().startsWith('bearer '))
            bearerString = bearerString.concat(token)
        else
            bearerString = token
        console.log('bearerString', bearerString)

        const response = await api
            .post('/api/blogs')
            .send(newBlogWithoutLikes)
            .set('authorization', bearerString)
            .expect(201)

        expect(response.body.likes).toEqual(0)
    })

    test('1.6 Checking title and url properties before create a new blog HTTP POST', async () => {
        const newBlogWithoutTitleUrl = {
            author: 'The god of blogs',
            likes: 33,
        }

        const userForLogin = {
            username: 'raiz',
            password: 'secreta'
        }
        let bearerString = 'bearer '
        const token = await tokenAfeterLogin(userForLogin)
        console.log(token)
        if (!token.toLowerCase().startsWith('bearer '))
            bearerString = bearerString.concat(token)
        else
            bearerString = token
        console.log('bearerString', bearerString)

        const response = await api
            .post('/api/blogs')
            .send(newBlogWithoutTitleUrl)
            .set('authorization', bearerString)

        expect(response.status).toBe(400)
    })
    
    test('1.7 Deleting a blog with HTTP DELETE request', async () => {
        // The databases were initializated without a user link to blogs neither a blogs array link to users so
        // a blog must be created with a link user before testing a blog delete.
        // So a login must be done before post a new blog link to the login user
        const newBlogWithoutLikes = {
            title: 'The blog creation',
            author: 'The god of blogs',
            url: 'http:localhost:1234',
        }

        const userForLogin = {
            username: 'raiz',
            password: 'secreta'
        }
        let bearerString = 'bearer '
        const token = await tokenAfeterLogin(userForLogin)
        console.log(token)
        if (!token.toLowerCase().startsWith('bearer '))
            bearerString = bearerString.concat(token)
        else
            bearerString = token
        console.log('bearerString', bearerString)

        const response = await api
            .post('/api/blogs')
            .send(newBlogWithoutLikes)
            .set('authorization', bearerString)
            .expect(201)
        //********************
        // Once the blog is created, blogs are fetched and the last (recently created)
        // is the one which has the user id of the logged in user who created that blog
        const getResponse = await api.get('/api/blogs')
        const body = getResponse.body
        console.log(body)
        const userUsername = body[initialBlogs.length].user.username
        console.log(userUsername)
        // Before deleting, checking that the username of the last blog is equal to the one logged in must be done
        if (userUsername !== userForLogin.username) {
            console.log('Something went wrong, a HTTP DELETE request will fail')
            expect(body).toHaveLength(initialBlogs.length + 1)
        }
        else {
            console.log('The usernames match, the HTTP DELETE request is sent')
            console.log(body[initialBlogs.length].id)
            const blogToDeleteId = body[initialBlogs.length].id
            const deleteResponse = await api
                .delete(`/api/blogs/${blogToDeleteId}`)
                .set('authorization', bearerString)
                .expect(204)

            expect(deleteResponse.status).toBe(204)
        }
        
    })

    test('1.8 Updating a blog with HTTP PUT request', async () => {
        // Getting the id from the first blog
        const getResponse = await api.get('/api/blogs')
        const idOfFirstBlog = getResponse.body[0].id
        // Defining a different blog
        const newBlog = {
            title: 'The blog creation',
            author: 'The god of blogs',
            url: 'http:localhost:1234',
            likes: 33,
        }
        // Updating the first blog with all differents properties (newBlog is send)
        const updateResponse = await api
            .put(`/api/blogs/${idOfFirstBlog}`)
            .send(newBlog)
            .expect(200)
        // As we expect that the routes handler has the logic of updating only likes
        // 
        expect(updateResponse.status).toBe(200)
    })

})

describe('2 Users management', () => {
    test('2.1 Fetching all users', async () => {
        const response = await api.get('/api/users')
        const users = response.body
        console.log(users)
        expect(response.status).toBe(200)
    })

    test('2.2 Creation succeeds with a fresh username', async () => {
        const responseAtStart = await api.get('/api/users')
        const usersAtStart = responseAtStart.body
        console.log(usersAtStart)
        const newUser = {
            username: 'juanimsand',
            name: 'Juan Imsand',
            password: 'mango',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const responseAtEnd = await api.get('/api/users')
        const usersAtEnd = responseAtEnd.body
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('2.3 Creation fails with proper statuscode and message if username already taken', async () => {
        const responseAtStart = await api.get('/api/users')
        const usersAtStart = responseAtStart.body

        const newUser = {
            username: 'raiz',
            name: 'Nombre Raiz',
            password: 'cualquiera',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        
        expect(result.body.error).toContain('`username` to be unique')

        const responseAtEnd = await api.get('/api/users')
        const usersAtEnd = responseAtEnd.body

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('2.4 Creation fails with proper statuscode and message if username is missing', async () => {
        const responseAtStart = await api.get('/api/users')
        const usersAtStart = responseAtStart.body

        const newUser = {
            name: 'Nombre Raiz',
            password: 'cualquiera',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        //console.log('Error: ', result.body.error)
        expect(result.body.error).toContain('`username` is required')

        const responseAtEnd = await api.get('/api/users')
        const usersAtEnd = responseAtEnd.body

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('2.5 Creation fails with proper statuscode and message if username length is not at least 3', async () => {
        const responseAtStart = await api.get('/api/users')
        const usersAtStart = responseAtStart.body

        const newUser = {
            username: 'ay',
            name: 'Nombre Raiz',
            password: 'cualquiera',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        //console.log('Error: ', result.body.error)
        expect(result.body.error).toContain('is shorter than the minimum allowed length')

        const responseAtEnd = await api.get('/api/users')
        const usersAtEnd = responseAtEnd.body

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
    
    test('2.6 Creation fails with proper statuscode and message if password is missing', async () => {
        const responseAtStart = await api.get('/api/users')
        const usersAtStart = responseAtStart.body

        const newUser = {
            username: 'raiz',
            name: 'Nombre Raiz',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        //console.log('Error: ', result.body.error)
        expect(result.body.error).toContain('password is required')

        const responseAtEnd = await api.get('/api/users')
        const usersAtEnd = responseAtEnd.body

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('2.7 Creation fails with proper statuscode and message if password length is not at least 3', async () => {
        const responseAtStart = await api.get('/api/users')
        const usersAtStart = responseAtStart.body

        const newUser = {
            username: 'fsouser',
            name: 'Nombre Raiz',
            password: 'fs',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        //console.log('Error: ', result.body.error)
        expect(result.body.error).toContain('password length is shorter than the minimum allowed')

        const responseAtEnd = await api.get('/api/users')
        const usersAtEnd = responseAtEnd.body

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

describe('3 Login management', () => {
    test('3.1 Login successful', async () => {
        const userForLogin = {
            username: 'raiz',
            password: 'secreta'
        }
        const response = await api
            .post('/api/login')
            .send(userForLogin)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const body = response.body

        expect(body.username).toBe(userForLogin.username)
    })

    test('3.2 Login with invalid user', async () => {
        const userForLogin = {
            username: 'raizz',
            password: 'secreta'
        }
        const response = await api
            .post('/api/login')
            .send(userForLogin)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const body = response.body

        expect(body.error).toContain('invalid username or password')
    })
    
    test('3.3 Login with invalid password', async () => {
        const userForLogin = {
            username: 'raiz',
            password: 'secret'
        }
        const response = await api
            .post('/api/login')
            .send(userForLogin)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const body = response.body

        expect(body.error).toContain('invalid username or password')
    })
})

afterAll(() => {
    mongoose.connection.close()
})