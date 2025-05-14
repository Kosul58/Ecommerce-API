# 📘 Project Features Documentation

## Functional Features

### 1. **Authentication**

- Token-based authentication using **JWT** for Users, Sellers, and Admins.

### 2. **Dependency Injection**

- Uses **Tsyringe** for managing dependencies and improving testability and modularity.

### 3. **Error Handling**

- Centralized error handling strategy for consistent and informative error responses.

### 4. **Response Handler**

- Unified response format for success and error messages.

### 5. **Data Validation**

- Input validation using **Joi** to ensure correctness and integrity of user-provided data.

### 6. **Factory patter**

- Facotry for repostitories to handle different types of database in the future.

### 7. **Logger**

- Data log using **Winston** to log all usefull data.

### 8. **Audit**

- Audit to store data about the API requests and the responses to the given requests.

### 9. **Cloud services**

- Cloud services using **Cloudinary** to store file data in the cloud.

### 10. **File Repository**

- Repository to store the meta data related to the cloud files.

---

### 11. **Core Operations**

#### a. **Product Operations**

- Add a product
- Add multiple products
- Update a product
- Delete a product
- Find a product
- Find all products
- Find products added by a specific seller
- hide products
- find hidden products
- make products visible

#### b. **Cart Operations**

- Add a product to a cart
- Update product quantity in a cart
- Remove a product from a cart
- Remove multiple products from a cart
- Find a user's cart
- Find multiple carts
- Find a specific product in a cart
- Calculate total price of products in a cart

#### c. **Order Operations**

- Create an order for a single product
- Create an order for multiple products
- Update the status of an order
- Update the status of a product within an order
- Cancel a single product from an order
- Cancel an entire order
- View orders of a user
- View all orders
- View a specific order

#### d. **Category Operations**

- Create a category
- Retrieve all categories
- Retrieve a single category by ID
- Update a category
- Delete a category

#### e. **User Operations**

- Sign up as a user
- Sign in as a user
- Find a user
- Update user information
- Delete a user

#### f. **Seller Operations**

- Sign up as a seller
- Sign in as a seller
- Update seller information
- Delete seller account
- Find a seller

---

### 12. **Platform-Specific Features**

#### a. **User Features**

- On signup: cart is auto-created and JWT is returned
- On login: JWT is returned
- Update user info (username, phone, etc.) with uniqueness check
- Delete account (deletes associated cart as well)
- Browse all products or search by ID
- Add/remove/update product in cart
- View all cart items
- Create an order (single or multiple products)
- Cancel single product or full order
- View all orders placed by the user

#### b. **Seller Features**

- On signup/login: JWT is returned
- Update seller profile (shop name, phone, etc.)
- Delete account (deletes all seller's products)
- Add one or multiple products
- Update product info (name, price, inventory, etc.)
- View all products added by seller
- View all products that have been ordered
- Update status of ordered products (Requested, Rejected, Accepted, Ready)

#### c. **Admin Features**

- Sign in (JWT issued)
- View all sellers, users, carts, and orders
- Delete sellers, and user.
- Remove all products of a seller
- Update order statuses
- Full CRUD operations on categories (create, read, update, delete)
- deactivate or activate a catagory
- hide seller products

---

## Non-Functional Features

- **Multi-User Support**: Concurrent support for multiple users and roles (User, Seller, Admin)
- **Scalability**: Designed to support multiple sellers adding products and handling orders simultaneously
- **Security**: Role-based access control with JWT protection
- **Modular Architecture**: Based on clean architecture principles using services, repositories, and dependency injection
- **Maintainability**: Separation of concerns using controllers, services, and repositories
- **Validation and Error Safety**: Strong input validation and error management mechanisms

# Authentication Flow (Signup/Signin)

## Signup

### Route: POST /api/user/signup or POST /api/seller/signup

### Input: JSON with user details (name, username, phone, email, password, etc.)

### Logic:

-> Validate input using Joi.

-> Check if username,phone,email is already used.

-> Hash the password using bcrypt.

-> Save user to DB.

-> Create a cart (for users).

-> Generate a JWT token and return it in the response.

## Signin

### Route: POST /api/user/signin or POST /api/seller/signin

### Input: JSON with username, email and password.

### Logic:

-> Validate input.

-> Find user by username and email.

-> Compare password with hashed password in DB.

-> If valid, generate and return JWT token.

## Token Usage

-> Include token in Authorization: Bearer <token> header for protected routes.

-> Middleware checks and verifies the token.

-> Role-based access control is enforced based on the user type in the token.

# Product Flow

## Add Product

### Route: POST /api/product

### Input: JSON with name, price, inventory , description and category

<!-- verifytoken
authorize role

Role Based access control

data validation

response handler

timestamp

sendgrid , nodemailer , payment gateway

health, server is up bhanni message dini from routes -->
