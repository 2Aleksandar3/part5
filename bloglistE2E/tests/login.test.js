const { test, expect, beforeEach, describe } = require('@playwright/test');
const { userInfo } = require('os');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Reset the database
    await request.post('http://localhost:3003/api/testing/reset');

    // Create a user for the backend
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Aleksandar Prodanic',
        username: 'aleksandar',
        password: 'sifra',
      },
    });

    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Jane Doe',
        username: 'jane',
        password: 'password',
      },})

    // Navigate to the app
    await page.goto('http://localhost:5173');
  });

  test('Login form is shown', async ({ page }) => {
    // Check for visibility of the username input
    const usernameInput = page.locator('input[name="Username"]');
    await expect(usernameInput).toBeVisible();

    // Check for visibility of the password input
    const passwordInput = page.locator('input[name="Password"]');
    await expect(passwordInput).toBeVisible();

    // Check for visibility of the login button
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // Fill in the login form
      await page.fill('input[name="Username"]', 'aleksandar');
      await page.fill('input[name="Password"]', 'sifra');
      await page.click('button[type="submit"]');

      // Check that the user is logged in
      const loggedInMessage = page.locator('text=Aleksandar Prodanic logged-in');
      await expect(loggedInMessage).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      // Fill in the login form with incorrect credentials
      await page.fill('input[name="Username"]', 'aleksandar');
      await page.fill('input[name="Password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Check for error message
      const errorMessage = page.locator('text=Wrong credentials');
      await expect(errorMessage).toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page}) => {
      // Log in the user
      
      await page.fill('input[name="Username"]', 'aleksandar');
      await page.fill('input[name="Password"]', 'sifra');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000)
    });

    test('a new blog can be created', async ({ page }) => {
      await page.click('text=add blog');
      await page.fill('input[name="Title"]', 'My New Blog');
      await page.fill('input[name="Author"]', 'Aleksandar Prodanic');
      await page.fill('input[name="Url"]', 'https://mynewblog.com');
      await page.click('button[type="submit"]');

      const newBlog = page.locator('text=My New Blog');
      await expect(newBlog).toBeVisible();

      
    });

    test('a blog can be liked', async ({ page }) => {
      
      await page.click('text=add blog');
      await page.fill('input[name="Title"]', 'My New Blog');
      await page.fill('input[name="Author"]', 'Aleksandar Prodanic');
      await page.fill('input[name="Url"]', 'https://mynewblog.com');
      await page.click('button[type="submit"]');
  
      
      const newBlog = page.locator('text=My New Blog');
      await expect(newBlog).toBeVisible();

      await page.getByRole('button', { name: 'view' }).click()
  
      
      await page.getByRole('button', { name: 'like' }).click()
  
      await page.waitForTimeout(1000)
      const likesDisplay = page.locator('.blog-likes'); 
await expect(likesDisplay).toBeVisible();
    });

    test('user who added the blog can delete it', async ({ page }) => {
      // Create a new blog
      await page.click('text=add blog');
      await page.fill('input[name="Title"]', 'My Blog to Delete');
      await page.fill('input[name="Author"]', 'Aleksandar Prodanic');
      await page.fill('input[name="Url"]', 'https://myblogtodelete.com');
      await page.click('button[type="submit"]');
    
      // Verify that the blog is created and visible
      const newBlog = page.locator('text=My Blog to Delete');
      await expect(newBlog).toBeVisible();
    
      // View the blog details
      await page.getByRole('button', { name: 'view' }).click();
    
      // Set up the dialog handler for confirmation
      page.on('dialog', async dialog => {
        await dialog.accept(); 
      });
    
      // Click the delete button for the blog
      await page.getByRole('button', { name: 'delete' }).click();
    
      // Verify that the blog is no longer visible
      await expect(newBlog).not.toBeVisible();
    });

    test('only the user who added the blog can see the delete button', async ({ page }) => {
      // Log in as the first user
      await page.fill('input[name="Username"]', 'aleksandar');
      await page.fill('input[name="Password"]', 'sifra');
      await page.click('button[type="submit"]');
  
      // Create a new blog
      await page.click('text=add blog');
      await page.fill('input[name="Title"]', 'My New Blog');
      await page.fill('input[name="Author"]', 'Aleksandar Prodanic');
      await page.fill('input[name="Url"]', 'https://mynewblog.com');
      await page.click('button[type="submit"]');
  
      // Log out
      await page.click('text=Log out');
  
      // Log in as the second user
      await page.fill('input[name="Username"]', 'jane');
      await page.fill('input[name="Password"]', 'password');
      await page.click('button[type="submit"]');
  
      // Navigate to the blog list and find the blog
      const newBlog = page.locator('text=My New Blog');
      await expect(newBlog).toBeVisible();

      await page.getByRole('button', { name: 'view' }).click();
  
      // Check that the delete button is NOT visible
      const deleteButton = newBlog.locator('button.delete-button');
      await expect(deleteButton).not.toBeVisible();
    });

    test('blogs are arranged in order according to likes', async ({ page, request }) => {
      
      // Create multiple blogs with different likes
      const blogs = [
        { title: 'Blog One', author: 'Author One', url: 'https://blogone.com', likes: 2 },
        { title: 'Blog Two', author: 'Author Two', url: 'https://blogtwo.com', likes: 5 },
        { title: 'Blog Three', author: 'Author Three', url: 'https://blogthree.com', likes: 3 },
      ];
      await page.click('text=add blog');
      
      for (let blog of blogs) {
        console.log(`Adding blog: ${blog.title}`)
        
        await page.fill('input[name="Title"]', blog.title);
        await page.fill('input[name="Author"]', blog.author);
        await page.fill('input[name="Url"]', blog.url);
        await page.click('button[type="submit"]');

        // Verify that the new blog is visible
        const newBlogLocator = page.locator(`text=${blog.title}`);
        await expect(newBlogLocator).toBeVisible();
        console.log('blog created',blog.title)
        console.log('blog id', blog.id)
        
        const returnedBlog = await page.evaluate(() => {
          const blogs = Array.from(document.querySelectorAll('.blog'));
          return blogs.map(blog => {
            const titleElement = blog.querySelector('.blog-title');
            const userElement = blog.querySelector('.blog-user');
            
            return {
              title: titleElement ? titleElement.textContent : 'No Title',
              user: userElement ? userElement.textContent : 'No User',
              id: blog.getAttribute('data-id') || 'No ID',
            };
          });
        });
        
        console.log('Whole blog:', returnedBlog);
        

        const viewButton = newBlogLocator.locator('xpath=following-sibling::button[contains(text(), "view")]');
        await expect(viewButton).toBeVisible(); 
        await viewButton.click();
  
        // Click the like button for the blog
        for(let i=0;i<=blog.likes;i++){
          console.log('Blog object being liked:', blog)
          await page.getByRole('button', { name: 'like' }).click()
          
          console.log(`${blog.title} has been liked ${i} times`)
          await page.waitForTimeout(500)
        }
        console.log(`Final Likes for ${blog.title}: ${blog.likes}`);
        
        

        await page.getByRole('button', { name: 'hide' }).click()
      }
      await page.waitForTimeout(4000)
      

      // Sort the expected titles based on likes
      const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);
      const sortedTitles = sortedBlogs.map(blog => blog.title);
      
      // Extract blog titles after waiting
      const blogElements = await page.locator('.blog-title').all();
      const blogTitles = await Promise.all(blogElements.map(async (element) => {
      return await element.textContent();
      }));
  
      console.log('All blog titles:', blogTitles)

      // Extract titles without the author
      const extractedTitles = blogTitles.map(title => title.split(' by ')[0]);

  

      console.log(sortedTitles,'sortedTitles')
      console.log(extractedTitles,'extractedTitles')

      // Check if the extracted titles match the sorted expected titles
     expect(extractedTitles).toEqual(sortedTitles);
    
    });
    
  });
});