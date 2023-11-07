# Natours API .

## Demo

See the live demo of the Wild-Oasis Quiz App: [Demo App](https://ahmed-ayman-natours.netlify.app/)

## Contact

If you have any questions or want to get in touch, you can find me on LinkedIn: [in/Ahmed-Ayman](https://www.linkedin.com/in/ahmed-ayman-723605229/)

## Features

### User Signup and Login

- **User Registration**: Users can sign up for your application by providing their email, username, and password. The password is securely hashed using Bcrypt.js before storing it in the database.

- **User Login**: Registered users can log in using their email and password. Upon successful login, a JSON Web Token (JWT) is generated and returned to the client for authentication on protected routes.

### Password Reset

- **Password Reset**: In case users forget their passwords, they can request a password reset by providing their email. A reset link is sent to their email address using Nodemailer and SendGrid.

### User Data Management

- **Update User Data**: Logged-in users can update their profile information, such as username, email, or other personal details. These changes are reflected in the MongoDB database.

- **Data Aggregation**: You can implement data aggregation features as needed. This can include collecting and summarizing data from various sources within your application, such as user statistics, order summaries, or any custom data aggregation requirements.

### Route Protection with JSON Web Tokens

- **JWT Authentication**: Many routes in your application are protected and require a valid JWT to access. This ensures that only authenticated users can access sensitive or restricted areas of your application.

- **Middleware Integration**: Middleware like `passport` and `jsonwebtoken` are used to validate JWT tokens and authenticate users. Unauthorized access is prevented by verifying the token's authenticity.

- **Error Handling**: If an invalid or expired JWT is presented, appropriate error handling and responses are in place to safeguard your application.

These key features ensure that your application offers a secure and seamless experience for users, with features like authentication, user data management, and route protection.

## Technologies

- Mongoose
- Express
- Stripe
- Bcrypt.js
- Cookie-parser
- Cors
- Dotenv
- Express-mongo-sanitize
- Express-rate-limit
- Helmet
- Hpp
- Jsonwebtoken
- Morgan
- Multer
- Nodemailer
- Nodemon
- Sharp
- Slugify
- Validator
- Xss-clean

## Endpoints

### 1. Users

#### Register a new user

- URL: `/api/users/signup`
- Method: `POST`
- Description: Register a new user with the Natours platform.
- Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "your_password",
  "passwordConfirm": "your_password"
}
```

#### Login

- URL: `/api/users/login`
- Method: `POST`
- Description: Log in an existing user and obtain an access token.
- Request Body:

```json
{
  "email": "john@example.com",
  "password": "your_password"
}
```

#### Get Current User

- URL: `/api/users/me`
- Method: `GET`
- Description: Get information about the currently logged-in user.
- Authorization: Required (Include access token in headers)

### 2. Tours

#### Get All Tours

- URL: `/api/tours`
- Method: `GET`
- Description: Get a list of all available tours.

#### Get Single Tour

- URL: `/api/tours/:tourId`
- Method: `GET`
- Description: Get detailed information about a specific tour.

#### Create a Tour

- URL: `/api/tours`
- Method: `POST`
- Description: Create a new tour.
- Authorization: Required (Include access token in headers)
- Request Body:

```json
{
  "name": "Tour Name",
  "duration": 7,
  "maxGroupSize": 12,
  "difficulty": "medium",
  "price": 1499.99,
  "summary": "Tour summary",
  "description": "Tour description",
  "imageCover": "tour-cover.jpg",
  "images": ["image1.jpg", "image2.jpg"],
  "startDates": ["2023-09-01", "2023-10-01"],
  "startLocation": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128],
    "address": "New York City, NY"
  },
  "locations": [
    {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749],
      "address": "San Francisco, CA"
    },
    {
      "type": "Point",
      "coordinates": [-118.2437, 34.0522],
      "address": "Los Angeles, CA"
    }
  ]
}
```

#### Update a Tour

- URL: `/api/tours/:tourId`
- Method: `PATCH`
- Description: Update information for an existing tour.
- Authorization: Required (Include access token in headers)
- Request Body: (Include only the fields you want to update)

```json
{
  "name": "New Tour Name",
  "price": 1699.99,
  "description": "Updated tour description"
}
```

#### Delete a Tour

- URL: `/api/v1/tours/:tourId`
- Method: `DELETE`
- Description: Delete a tour.
- Authorization: Required (Include access token in headers)

### 3. Reviews

#### Get All Reviews for a Tour

- URL: `/api/v1/tours/:tourId/reviews`
- Method: `GET`
- Description: Get all the reviews for a specific tour.

#### Create a Review

- URL: `/api/tours/:tourId/reviews`
- Method: `POST`
- Description: Create a new review for a tour.
- Authorization: Required (Include access token in headers)
- Request Body:

```json
{
  "review": "A fantastic tour! Highly recommended.",
  "rating": 5
}
```

#### Get Single Review

- URL: `/api/reviews/:reviewId`
- Method: `GET`
- Description: Get detailed information about a specific review.

#### Update a Review

- URL: `/api/v1/reviews/:reviewId`
- Method: `PATCH`
- Description: Update information for an existing review.
- Authorization: Required (Include access token in headers)
- Request Body: (Include only the fields you want to update)

```json
{
  "review": "An even better experience than I expected!"
}
```

#### Delete a Review

- URL: `/api/reviews/:reviewId`
- Method: `DELETE`
- Description: Delete a review.
- Authorization: Required (Include access token in headers)

## Error Handling

The API will respond with appropriate error messages and status codes in case of any errors. Refer to the specific endpoint documentation for possible error responses.
