import React from 'react'
import PropTypes from 'prop-types'

const Notification = ({ message, type }) => {
  if (!message) return null

  const notificationStyle = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    color: 'white',
    backgroundColor: type === 'error' ? 'red' : 'green',
    textAlign: 'center',
    position: 'fixed',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
  }

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export default Notification