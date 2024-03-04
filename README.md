# Twitter Backend

This project is a backend application for a Twitter-like platform. It provides APIs for user authentication, profile management, and other functionalities required for building a Twitter-like application.

## Features

- **Signup with Email Verification:** Users can sign up for an account. Upon registration, an email verification link is sent to the user's email address to verify their account.
  
- **Sign In with JWT:** Users can sign in to their accounts using JSON Web Tokens (JWT) for authentication. JWT tokens are generated upon successful authentication and are used to authorize API requests.
  
- **Forgot Password and Reset Password:** Users can request a password reset link if they forget their password. The reset link is sent to the user's email address, allowing them to set a new password.
  
- **Update Profile and Bio:** Users can update their profile information, including their display name, profile picture, and bio.
  
- **Logout:** Users can log out of their accounts, invalidating their JWT token and requiring reauthentication for subsequent requests.

## Technologies Used

- **Node.js:** JavaScript runtime for building server-side applications.
  
- **Express.js:** Web application framework for Node.js used for building APIs and handling HTTP requests.
  
- **MongoDB:** NoSQL database for storing user data and other application data.
  
- **JWT (JSON Web Tokens):** Standard for securely transmitting information between parties as a JSON object.


