# Twitter Backend

This project is a backend application for a Twitter-like platform. It provides APIs for user authentication, profile management, and other functionalities required for building a Twitter-like application.

## Features

- **Signup with Email Verification:** Users can sign up for an account. Upon registration, an email verification link is sent to the user's email address to verify their account.
  
- **Sign In with JWT:** Users can sign in to their accounts using JSON Web Tokens (JWT) for authentication. JWT tokens are generated upon successful authentication and are used to authorize API requests.
  
- **Forgot Password and Reset Password:** Users can request a password reset link if they forget their password. The reset link is sent to the user's email address via Nodemailer, allowing them to set a new password.
  
- **Update Profile and Bio:** Users can update their profile information, including their display name, profile picture, and bio.
  
- **Tweeting Functionality:**
  - Users can create tweets.
  - Users can like tweets.
  - Users can comment on tweets.
  - Users can delete their own tweets.
  - Users can update existing tweets.
  
- **View Tweets:** Users can view tweets from other users and their own timeline.
  
- **Delete Account:** Users have the option to delete their account, which permanently removes their data from the platform.

## Technologies Used

- **Node.js:** JavaScript runtime for building server-side applications.
  
- **Express.js:** Web application framework for Node.js used for building APIs and handling HTTP requests.
  
- **MongoDB:** NoSQL database for storing user data and other application data.
  
- **Nodemailer:** Module for sending emails from Node.js applications, used for sending password reset links.
  
- **JWT (JSON Web Tokens):** Standard for securely transmitting information between parties as a JSON object.
