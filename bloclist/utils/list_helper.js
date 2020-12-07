const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const reducer = (sum, item) => {
        return sum + item
    }

    return blogs.length === 0
        ? 0
        : likes.reduce(reducer, 0) / blogs.length
}

const favouriteBlog = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const favBlogLikes = Math.max(...likes)

    const favBlog = blogs.find(blog => blog.likes === favBlogLikes)

    return favBlog
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0)
        return null
    else {
        //const authors = blogs.map(blog => blog.authors)
        const mostBlogsObject = lodash.maxBy(blogs, 'author')
        const mostBlogsAuthor = mostBlogsObject.author
        const quantityOfBlogs = lodash.countBy(blogs, 'author')
        let quantityOfBLogsByAuthor = lodash.pick(quantityOfBlogs, mostBlogsAuthor)
        quantityOfBLogsByAuthor = lodash.get(quantityOfBLogsByAuthor, mostBlogsAuthor)
        const result = {
            Author: mostBlogsAuthor,
            Blogs: quantityOfBLogsByAuthor
        }
        return result
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0)
        return null
    else {
        //const authors = blogs.map(blog => blog.authors)
        const mostLikesObject = lodash.maxBy(blogs, 'likes')
        console.log(mostLikesObject)
        const mostLikesAuthor = mostLikesObject.author
        //const quantityOfBlogs = lodash.countBy(blogs, 'author')
        //let quantityOfBLogsByAuthor = lodash.pick(quantityOfBlogs, mostBlogsAuthor)
        //quantityOfBLogsByAuthor = lodash.get(quantityOfBLogsByAuthor, mostBlogsAuthor)
        const result = {
            Author: mostLikesObject.author,
            Likes: mostLikesObject.likes
        }
        return result
    }
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes,
}