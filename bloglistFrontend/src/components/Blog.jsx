import React, { useState } from 'react'
import PropTypes from 'prop-types'


const Blog = ({ blog,handleLike,handleDelete, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }




  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const likeBlog = () => {
    console.log('likeBlog',blog.title)
    handleLike(blog)
  }

  const deleteBlog = () => {
    if (window.confirm(`Delete blog "${blog.title}" by ${blog.author}?`)) {
      handleDelete(blog)
    }
  }

  return (
    <div style={blogStyle} className="blog"  data-id={blog._id}>
      <div className="blog-title">
        {blog.title} by {blog.author}
      </div>
      <button onClick={toggleVisibility} className="toggle-button">
       {visible ? 'hide' : 'view'}
      </button>
      {visible && (
        <div className="blog-details">
        <div className="blog-url">URL: {blog.url}</div>
          <div className="blog-likes">likes: {blog.likes}</div>
          <button type="button" onClick={likeBlog} className="like-button">like</button>
          <div className="blog-user">User: {blog.user ? blog.user.username : 'Unknown User'}</div>
          {blog.user && blog.user._id === user.id && (
            <button onClick={deleteBlog} className="delete-button">delete</button>
          )}
        </div>
      )}
    </div>
  )
}


Blog.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number,
    user: PropTypes.shape({
      username: PropTypes.string,
      _id: PropTypes.string,
    }),
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
}


export default Blog