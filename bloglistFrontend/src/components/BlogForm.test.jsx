import { render, screen } from '@testing-library/react';
import BlogForm from './BlogForm';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

test('<BlogForm /> updates parent state and calls addBlog', async () => {
  const mockAddBlog = vi.fn();
  const mockShowNotification = vi.fn();
  const user = userEvent.setup();

  render(<BlogForm addBlog={mockAddBlog} showNotification={mockShowNotification} />);

  // Access input fields by role
  const titleInput = screen.getAllByRole('textbox')[0]; // First textbox for title
  const authorInput = screen.getAllByRole('textbox')[1]; // Second textbox for author
  const urlInput = screen.getAllByRole('textbox')[2]; // Third textbox for url
  const submitButton = screen.getByRole('button', { name: /submit/i });

  // Simulate user input
  await user.type(titleInput, 'New Blog Title');
  await user.type(authorInput, 'New Author');
  await user.type(urlInput, 'http://newblog.com');

  // Simulate clicking the submit button
  await user.click(submitButton);

  // Assert that addBlog was called with the correct parameters
  expect(mockAddBlog).toHaveBeenCalledWith({
    title: 'New Blog Title',
    author: 'New Author',
    url: 'http://newblog.com',
  });

  // Assert that the notification was shown
  expect(mockShowNotification).toHaveBeenCalledWith('Blog added successfully', 'success');
});