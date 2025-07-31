# Postman Collection Setup Guide

This guide will help you set up and use the Amora API Postman collection.

## 📁 Files Included

- `Amora_API_Collection.json` - Complete Postman collection with all API endpoints

## 🚀 Quick Setup

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the `Amora_API_Collection.json` file
4. The collection will be imported with all endpoints organized in folders

### 2. Configure Environment Variables

The collection uses the following variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `authToken` | JWT token for regular user | (empty) |
| `adminToken` | JWT token for admin user | (empty) |

### 3. Set Up Your Environment

1. In Postman, go to **Environments** tab
2. Create a new environment called "Amora API"
3. Add the variables above with appropriate values
4. Select your environment from the dropdown

## 📋 API Endpoints Overview

### 🔍 Health Check
- **GET** `/health` - Check server status

### 🔐 Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user
- **GET** `/api/auth/profile` - Get user profile
- **PUT** `/api/auth/profile` - Update user profile
- **POST** `/api/auth/change-password` - Change password
- **POST** `/api/auth/logout` - Logout
- **POST** `/api/auth/refresh` - Refresh token

### 👥 User Management (Admin Only)
- **GET** `/api/users` - Get all users with pagination
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user by ID
- **DELETE** `/api/users/:id` - Delete user by ID

### 📚 Genre Management
- **GET** `/api/genres/active` - Get active genres (public)
- **GET** `/api/genres/slug/:slug` - Get genre by slug (public)
- **POST** `/api/genres` - Create genre (admin)
- **GET** `/api/genres` - Get all genres (admin)
- **GET** `/api/genres/:id` - Get genre by ID (admin)
- **PUT** `/api/genres/:id` - Update genre (admin)
- **DELETE** `/api/genres/:id` - Delete genre (admin)
- **PATCH** `/api/genres/:id/toggle` - Toggle genre status (admin)

## 🧪 Testing Workflow

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Test Health Check
1. Run the **Health Check** request
2. Verify server is running (should return 200 OK)

### Step 3: Create Test Users
1. Run **Register User** to create a regular user
2. Run **Register Admin** to create an admin user
3. Copy the JWT tokens from the responses

### Step 4: Set Up Authentication
1. Update the `authToken` variable with the regular user's token
2. Update the `adminToken` variable with the admin user's token

### Step 5: Test Authentication
1. Run **Login User** and **Login Admin** to verify authentication
2. Run **Get Current User** to test token validation

### Step 6: Test Genre Management
1. Run **Get Active Genres** (should work without auth)
2. Run **Create Genre** with admin token
3. Test other genre endpoints with admin token

### Step 7: Test User Management
1. Run **Get All Users** with admin token
2. Test other user management endpoints

## 🔧 Collection Features

### ✅ Pre-configured Requests
- All endpoints are pre-configured with proper headers
- Request bodies are formatted for easy editing
- URL parameters are set up for dynamic values

### 🔄 Environment Variables
- Uses `{{baseUrl}}` for easy server URL changes
- Uses `{{authToken}}` and `{{adminToken}}` for authentication
- Path variables like `:userId` and `:genreId` for dynamic IDs

### 📝 Request Examples
- Sample request bodies for all POST/PUT requests
- Query parameters for pagination and filtering
- Proper Content-Type headers

## 🎯 Common Use Cases

### Testing Authentication Flow
1. Register a new user
2. Login with the user credentials
3. Copy the token from the response
4. Update the `authToken` variable
5. Test protected endpoints

### Testing Admin Functions
1. Register an admin user
2. Login with admin credentials
3. Copy the admin token
4. Update the `adminToken` variable
5. Test admin-only endpoints

### Testing Genre Management
1. Use admin token to create genres
2. Test public endpoints without authentication
3. Test admin-only genre management functions

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check if the token is valid
- Verify the token is properly set in variables
- Make sure the token hasn't expired

**403 Forbidden**
- Ensure you're using admin token for admin-only endpoints
- Check if the user has the correct role

**404 Not Found**
- Verify the server is running
- Check the `baseUrl` variable
- Ensure the endpoint path is correct

**422 Validation Error**
- Check the request body format
- Verify all required fields are provided
- Check field validation rules

### Debug Tips

1. **Check Response Headers**: Look for authentication errors
2. **Verify Token Format**: Ensure tokens start with "Bearer "
3. **Test with curl**: Use curl to verify API functionality
4. **Check Server Logs**: Monitor server console for errors

## 📊 Expected Responses

### Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Updating the Collection

To add new endpoints or modify existing ones:

1. Export the current collection
2. Make your changes in Postman
3. Export the updated collection
4. Replace the `Amora_API_Collection.json` file

## 📞 Support

If you encounter issues:

1. Check the server logs for errors
2. Verify all environment variables are set
3. Test endpoints individually
4. Check the API documentation in the README

---

**Happy Testing! 🚀** 