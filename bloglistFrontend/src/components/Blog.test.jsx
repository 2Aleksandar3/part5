import { render, screen, fireEvent } from '@testing-library/react';
import Blog from './Blog';
import BlogForm from './BlogForm'; // Import your BlogForm component
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('Blog Component', () => {
  const mockHandleLike = vi.fn();
  const mockHandleDelete = vi.fn();

  const blog = {
    id: '1',
    title: 'Component testing is done with react-testing-library',
    author: 'John Doe',
    url: 'http://example.com',
    likes: 10,
    user: { id: '123', username: 'testuser' },
  };

  const user = { id: '123', username: 'testuser' };

  test('renders content', () => {
    render(
      <Blog 
        blog={blog} 
        handleLike={mockHandleLike} 
        handleDelete={mockHandleDelete} 
        user={user} 
      />
    );

    // Check that the title and author are rendered
    expect(screen.getByText(/Component testing is done with react-testing-library/)).toBeDefined();
    expect(screen.getByText(/John Doe/)).toBeDefined();

    // Ensure that the URL and likes are not rendered by default
    expect(screen.queryByText(/http:\/\/example\.com/)).toBeNull();
    expect(screen.queryByText(/likes: 10/)).toBeNull();
  });

  test('shows URL and likes when view button is clicked', () => {
    render(
      <Blog 
        blog={blog} 
        handleLike={mockHandleLike} 
        handleDelete={mockHandleDelete} 
        user={user} 
      />
    );

    // Simulate the "view" button click to show details
    fireEvent.click(screen.getByText('view'));

    // After clicking "view", the URL and likes should be visible
    expect(screen.getByText(/URL: http:\/\/example\.com/)).toBeDefined();
    expect(screen.getByText(/likes: 10/)).toBeDefined();

    // Simulate clicking the "hide" button to toggle visibility back
    fireEvent.click(screen.getByText('hide'));

    // After clicking "hide", the URL and likes should be hidden again
    expect(screen.queryByText(/URL: http:\/\/example\.com/)).toBeNull();
    expect(screen.queryByText(/likes: 10/)).toBeNull();
  });
  test('calls handleLike twice when like button is clicked twice', () => {
    const mockHandleLike = vi.fn();
    const mockHandleDelete = vi.fn();

    const blog = {
      id: '1',
      title: 'Component testing is done with react-testing-library',
      author: 'John Doe',
      url: 'http://example.com',
      likes: 10,
      user: { id: '123', username: 'testuser' },
    };

    const user = { id: '123', username: 'testuser' };

    render(
      <Blog 
        blog={blog} 
        handleLike={mockHandleLike} 
        handleDelete={mockHandleDelete} 
        user={user} 
      />
    );

    // Show details to make like button accessible
    fireEvent.click(screen.getByText('view'));
    
    // Simulate clicking the like button twice
    const likeButton = screen.getByText('like'); // Adjust as necessary
    fireEvent.click(likeButton);
    fireEvent.click(likeButton);
    
    expect(mockHandleLike).toHaveBeenCalledTimes(2);
  });
});
