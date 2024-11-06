import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/notification'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [newBlogVisible, setNewBlogVisible] = useState(false)

  useEffect(() => {
    blogService.getAll().then(blogs => {
      console.log('Fetched blogs:', blogs)
      setBlogs( blogs )
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    console.log('LoginForm re-rendered')
    console.log('Username:', username)
    console.log('Password:', password)
  }, [username, password])

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification({ message: '', type: '' })
    }, 5000) // Notification disappears after 5 seconds
  }




  const handleLogin = async (event) => {
    event.preventDefault()

    console.log('Attempting login with:', username, password)

    try {
      console.log('Logging in with:', username, password)
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      console.log('User when login ',user)

      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      console.error('Login error:', exception)
      setErrorMessage('Wrong credentials')
      showNotification('Wrong credentials', 'error')
      setTimeout(() => {
        setErrorMessage(null)

      }, 5000)
    }
  }


  const handleLike = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,  //Increment likes
      user:blog.user.id,
    }
    console.log('trying different blog users',blog.user._id ,blog.user.id,blog.user.username)

    try {
      const returnedBlog = await blogService.update(updatedBlog) // Call the update function
      setBlogs(blogs.map(b => (b.id === returnedBlog.id ? returnedBlog : b))) // Update the state
      showNotification('Blog liked successfully', 'success')
      console.log('Returned blog:', returnedBlog)
    } catch (exception) {
      console.error('Error liking blog:', exception)
      setErrorMessage('Error liking blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }

  }

  const handleDelete = async (blog) => {
    try {
      await blogService.deleteBlog(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
      showNotification(`Blog "${blog.title}" deleted successfully`, 'success')
    } catch (exception) {
      console.error('Error deleting blog:', exception)
      setErrorMessage('Error deleting blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }


  const addBlog = async ({ title,author,url }) => {

    console.log('Add blog button clicked')

    try {
      const newBlog = { title, author, url ,user:user.id, }
      console.log('New blog data:', newBlog)
      const returnedBlog = await blogService.create(newBlog)
      setBlogs(blogs.concat(returnedBlog))

      showNotification('Blog added successfully', 'success')
    } catch (exception) {
      console.error('Error adding blog:', exception)
      setErrorMessage('Error adding blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }



  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null) // Optionally clear the token from blogService
    setUser(null)}

  const newBlogForm = () => {
    const hideWhenVisible = { display: newBlogVisible ? 'none' : '' }
    const showWhenVisible = { display: newBlogVisible ? '' : 'none' }
    return(<div>
      <h2>add new blog</h2>
      <div style={hideWhenVisible}>
        <button onClick={() => setNewBlogVisible(true)}>add blog</button>
      </div>
      <div style={showWhenVisible}>
        <BlogForm
          showNotification={showNotification}

          addBlog={addBlog} />
        <button onClick={() => setNewBlogVisible(false)}>cancel</button>
      </div>
    </div>)
  }

  if (user === null) {
    return (
      <div>
        <Notification message={notification.message} type={notification.type} />
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
          username:
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => {console.log('Username input changed to:', target.value), setUsername(target.value)}}
            />

          </div>
          <div>
          password:
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <Notification message={notification.message} type={notification.type} />
      <h2>blogs</h2>
      <p>{user.name} logged-in</p>
      <button onClick={handleLogout}>Log out</button>
      {newBlogForm()}
      {blogs.sort((a, b) => b.likes - a.likes).map(blog =>
        <Blog key={blog.id} blog={blog} handleLike={handleLike} handleDelete={handleDelete} user={blog.user} />
      )}
    </div>
  )

}

export default App

