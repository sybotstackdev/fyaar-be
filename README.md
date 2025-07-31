# Node.js MongoDB Boilerplate

A simple and clean Node.js boilerplate with MongoDB, Express, and JWT authentication.

## Features

- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Token-based authentication
- **Password Hashing** - Secure password storage with bcryptjs
- **Input Validation** - Request validation with express-validator
- **Rate Limiting** - API rate limiting for security
- **Error Handling** - Global error handling middleware
- **CORS** - Cross-Origin Resource Sharing support
- **Security Headers** - Helmet for security
- **Compression** - Response compression
- **Testing** - Jest and Supertest for testing
- **Genre Management** - Admin-only genre CRUD operations

## Project Structure

```
src/
├── config/
│   ├── database.js      # MongoDB connection
│   └── environment.js   # Environment configuration
├── controllers/
│   ├── userController.js # User API controllers
│   └── genreController.js # Genre API controllers
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── errorHandler.js  # Global error handling
│   ├── rateLimiter.js   # Rate limiting
│   └── validator.js     # Input validation
├── models/
│   ├── userModel.js     # User model
│   └── genreModel.js    # Genre model
├── routes/
│   ├── index.js         # Main router
│   ├── userRoutes.js    # User routes
│   └── genreRoutes.js   # Genre routes
├── services/
│   ├── userService.js   # Business logic
│   └── genreService.js  # Genre business logic
├── utils/
│   ├── logger.js        # Simple logging
│   └── response.js      # API response utilities
└── server.js            # Main server file
```

## Prerequisites

- Node.js (>= 14.0.0)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/amora
JWT_SECRET=your-secret-key-here
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

6. Seed initial genres (optional):
```bash
npm run seed:genres
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout (client-side)

### User Management (Admin only)
- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

### Genre Management
- `GET /api/genres/active` - Get active genres (public)
- `GET /api/genres/slug/:slug` - Get genre by slug (public)
- `POST /api/genres` - Create new genre (admin only)
- `GET /api/genres` - Get all genres with pagination (admin only)
- `GET /api/genres/:id` - Get genre by ID (admin only)
- `PUT /api/genres/:id` - Update genre (admin only)
- `DELETE /api/genres/:id` - Delete genre (admin only)
- `PATCH /api/genres/:id/toggle` - Toggle genre status (admin only)

### Health Check
- `GET /health` - Server health status

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run seed:genres` - Seed initial genres

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/amora` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

## Testing

Run the test suite:
```bash
npm test
```

## Genre System

The application includes a comprehensive genre management system:

### Genre Model Features:
- **Title**: Unique genre name (2-100 characters)
- **Description**: Detailed genre description (10-1000 characters)
- **Slug**: Auto-generated URL-friendly identifier
- **Active Status**: Toggle to show/hide genres
- **Timestamps**: Created and updated timestamps

### Admin Features:
- Create, read, update, delete genres
- Toggle genre active status
- Search and filter genres
- Pagination support

### Public Features:
- View active genres only
- Access genres by slug
- No authentication required for public endpoints

### Pre-seeded Genres:
The system comes with 11 pre-configured romance genres:
1. College Romance
2. Office Romance
3. Arranged Marriage / Forced Proximity
4. Second Chance / Rekindled Love
5. Friends to Lovers
6. Enemies to Lovers
7. Forbidden / Taboo Romance
8. Strangers to Lovers
9. Fake Relationship / Pretend Love
10. Late Bloom / Healing Romance
11. Speculative / Sci-Fi / Fantasy Romance

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- Security headers with Helmet
- CORS protection
- Admin-only access for sensitive operations

## Error Handling

The application includes comprehensive error handling:
- Global error handler middleware
- Custom error classes
- Validation error handling
- Database error handling
- JWT error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 