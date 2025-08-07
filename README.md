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
- `POST /api/auth/send-login-otp` - Send login OTP to email
- `POST /api/auth/login-otp` - Login with OTP verification
- `POST /api/auth/send-registration-otp` - Send registration OTP to email
- `POST /api/auth/register-otp` - Register with OTP verification
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

### Spice and Mood Setting Management
- `GET /api/spice-moods/slug/:slug` - Get spice mood by slug (public)
- `POST /api/spice-moods` - Create new spice mood setting (admin only)
- `GET /api/spice-moods` - Get all spice mood settings with pagination (admin/user)
- `GET /api/spice-moods/:id` - Get spice mood by ID (admin only)
- `PUT /api/spice-moods/:id` - Update spice mood setting (admin only)
- `DELETE /api/spice-moods/:id` - Delete spice mood setting (admin only)
- `PATCH /api/spice-moods/:id/toggle` - Toggle spice mood status (admin only)

### Narrative Management
- `GET /api/narratives/active` - Get active narratives (public)
- `GET /api/narratives/slug/:slug` - Get narrative by slug (public)
- `POST /api/narratives` - Create new narrative option (admin only)
- `GET /api/narratives` - Get all narratives with pagination (admin only)
- `GET /api/narratives/:id` - Get narrative by ID (admin only)
- `PUT /api/narratives/:id` - Update narrative (admin only)
- `DELETE /api/narratives/:id` - Delete narrative (admin only)
- `PATCH /api/narratives/:id/toggle` - Toggle narrative status (admin only)

### Health Check
- `GET /health` - Server health status

### Location Management
- `GET /api/locations/category/:category` - Get locations by category (public)
- `GET /api/locations/slug/:slug` - Get location by slug (public)
- `POST /api/locations` - Create new location (admin only)
- `GET /api/locations` - Get all locations with pagination (admin/user)
- `GET /api/locations/:id` - Get location by ID (admin only)
- `PUT /api/locations/:id` - Update location (admin only)
- `DELETE /api/locations/:id` - Delete location (admin only)
- `PATCH /api/locations/:id/toggle` - Toggle location status (admin only)

### Author Management
- `GET /api/authors` - Get all authors with pagination and filtering (public)
- `GET /api/authors/:id` - Get author by ID (public)
- `POST /api/authors` - Create new author (admin only)
- `PUT /api/authors/:id` - Update author (admin only)
- `DELETE /api/authors/:id` - Delete author (admin only)
- `PATCH /api/authors/:id/deactivate` - Deactivate author (admin only)
- `PATCH /api/authors/:id/reactivate` - Reactivate author (admin only)

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run seed:locations` - Seed database with 50 locations across 5 categories
- `npm run seed:authors` - Seed database with 10 sample authors

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/amora` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `MAILGUN_API_KEY` | Mailgun API key for email sending | Required |
| `MAILGUN_DOMAIN` | Mailgun domain for email sending | Required |

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

## Spice and Mood Setting System

The application includes a comprehensive spice and mood setting management system:

### Spice Mood Model Features:
- **Combo Name**: Unique combo name (2-100 characters)
- **Mood + Spice Blend**: Array of mood and spice elements (1-200 characters each)
- **Intensity**: Predefined intensity levels (Low, Low–Med, Medium, High, Very High)
- **Description**: Detailed description (10-1000 characters)
- **Slug**: Auto-generated URL-friendly identifier
- **Active Status**: Toggle to show/hide spice mood settings
- **Timestamps**: Created and updated timestamps

### Admin Features:
- Create, read, update, delete spice mood settings
- Toggle spice mood active status
- Search and filter by combo name, description, or mood/spice blend
- Filter by intensity level
- Pagination support

### Public Features:
- Access spice mood settings by slug
- No authentication required for public endpoints

### Pre-seeded Spice Mood Settings:
The system comes with 5 pre-configured spice and mood settings:
1. **Sweet & Soft** (Low) - Purely emotional, blushes, longing looks, soft build-up
2. **Warm & Tender** (Low–Med) - Gentle romance, emotional closeness, a kiss or slow burn
3. **Messy & Real** (Medium) - Realistic heat, stumbles, awkwardness, vulnerability
4. **Bold & Heated** (High) - Intense passion, open desire, emotionally driven sex
5. **Raw & Wild** (Very High) - Fully unfiltered desire, explicit, dominant/submissive energy

## Narrative System

The application includes a comprehensive narrative perspective management system:

### Narrative Model Features:
- **Option Label**: Unique narrative option name (2-100 characters)
- **Description**: Detailed description of the narrative perspective (10-500 characters)
- **Slug**: Auto-generated URL-friendly identifier
- **Active Status**: Toggle to show/hide narrative options
- **Timestamps**: Created and updated timestamps

### Admin Features:
- Create, read, update, delete narrative options
- Toggle narrative active status
- Search and filter narrative options
- Pagination support

### Public Features:
- View active narrative options only
- Access narratives by slug
- No authentication required for public endpoints

### Pre-seeded Narrative Options:
The system comes with 4 pre-configured narrative perspective options:
1. **First Person – Dual POV** - The story alternates between heroine and hero's first-person perspectives. Ideal for emotional depth.
2. **Third Person – Limited (Female Lead)** - Written in third person, following only the heroine's thoughts and emotions. Best for subtle storytelling.
3. **First Person – Female POV** - Entire story from heroine's first-person view. Relatable and direct.
4. **Third Person – Dual POV** - Third-person narration alternating focus between the hero and heroine. Balanced and classic.

## Location System

The application includes a comprehensive location management system for story settings:

### Location Model Features:
- **Name**: Unique location name (2-100 characters)
- **Category**: Predefined categories for story types
- **Description**: Detailed location description (10-1000 characters)
- **Country**: Location country (2-100 characters)
- **State**: Optional state/province (2-100 characters)
- **Slug**: Auto-generated URL-friendly identifier
- **Active Status**: Toggle to show/hide locations
- **Timestamps**: Created and updated timestamps

### Location Categories:
1. **🏙️ Tier-1 Cities** (`tier1-cities`) - Urban, cosmopolitan settings
   - Use cases: Office romances, fast-paced lives, career-focused stories, startup culture
   - Examples: Mumbai, Delhi, Bangalore, Hyderabad, Pune, Chennai, Kolkata, Gurgaon, Noida

2. **🏡 Tier-2 Cities** (`tier2-cities`) - Grounded, relatable settings
   - Use cases: Nostalgic homecomings, small-town values vs big dreams, second chances
   - Examples: Jaipur, Bhopal, Kochi, Lucknow, Indore, Surat, Nagpur, Chandigarh, Guwahati

3. **🏖️ Vacation & Travel** (`vacation-travel`) - Adventure and getaway settings
   - Use cases: Vacation romances, adventure stories, spiritual journeys, romantic getaways
   - Examples: Goa, Manali, Udaipur, Pondicherry, Rishikesh, Leh-Ladakh, Ooty, Darjeeling

4. **🌍 International** (`international`) - Global and cross-cultural settings
   - Use cases: NRI romance, digital nomad vibes, remote working flings, cross-cultural tension
   - Examples: New York, London, Dubai, Paris, Singapore, Toronto, Sydney, Bali, Tokyo, Istanbul

5. **🧙 Speculative/Fantasy** (`speculative-fantasy`) - Sci-fi and fantasy settings
   - Use cases: Sci-fi romance, fantasy love stories, paranormal romance, magical realism
   - Examples: Alternate futuristic city, Magical university, Floating islands, Tech-dystopia India, Enchanted forest, Shifter clan territory, Post-apocalyptic wasteland, Interdimensional café, Vampire-dominated metropolis, Reincarnation loops across eras

### Admin Features:
- Create, read, update, delete locations
- Toggle location active status
- Search and filter by name, description, or country
- Filter by category and country
- Pagination support

### Public Features:
- View locations by category
- Access locations by slug
- No authentication required for public endpoints

### Pre-seeded Locations:
The system comes with 50 pre-configured locations across all 5 categories, providing diverse settings for romance story generation.

## OTP Authentication System

The application includes a comprehensive One-Time Password (OTP) authentication system using Mailgun for email delivery:

### OTP Features:
- **6-digit numeric OTPs** - Secure, easy-to-enter codes
- **10-minute expiration** - Automatic cleanup for security
- **Email delivery** - Professional HTML email templates
- **Multiple OTP types** - Login, registration, and password reset support
- **Rate limiting** - Prevents abuse and spam
- **Validation** - Comprehensive input validation
- **TTL indexing** - Automatic database cleanup

### OTP Flow:

#### Login with OTP:
1. **Send OTP**: `POST /api/auth/send-login-otp`
   ```json
   {
     "email": "user@example.com"
   }
   ```
2. **Verify OTP**: `POST /api/auth/login-otp`
   ```json
   {
     "email": "user@example.com",
     "otp": "123456"
   }
   ```

#### Registration with OTP:
1. **Send OTP**: `POST /api/auth/send-registration-otp`
   ```json
   {
     "email": "newuser@example.com"
   }
   ```
2. **Register with OTP**: `POST /api/auth/register-otp`
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "newuser@example.com",
     "password": "password123",
     "otp": "123456"
   }
   ```

### Email Templates:
- **Professional HTML design** - Branded with Amora styling
- **Security warnings** - Clear instructions about OTP safety
- **Responsive design** - Works on all email clients
- **Multiple templates** - Different designs for login, registration, and welcome emails

### Security Features:
- **OTP expiration** - 10-minute automatic timeout
- **Single-use OTPs** - Each OTP can only be used once
- **Rate limiting** - Prevents OTP spam
- **Email validation** - Ensures valid email addresses
- **Database cleanup** - Automatic removal of expired OTPs

### Mailgun Configuration:
1. **Sign up for Mailgun** - Create account at mailgun.com
2. **Get API key** - From Mailgun dashboard
3. **Configure domain** - Set up sending domain
4. **Update environment** - Add to `.env` file:
   ```env
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   ```

### OTP Model Features:
- **Email tracking** - Links OTPs to specific email addresses
- **Type classification** - Distinguishes between login, registration, etc.
- **Usage tracking** - Prevents OTP reuse
- **Expiration handling** - Automatic cleanup via TTL index
- **Validation methods** - Helper functions for OTP verification

## Author System

The application includes a comprehensive author management system for tracking writers and their writing styles:

### Author Model Features:
- **Author Name**: Unique author name (2-100 characters)
- **Writing Style**: Detailed description of the author's writing style (10-1000 characters)
- **Pen Name**: Author's pen name or pseudonym (2-100 characters)
- **Active Status**: Toggle to show/hide authors
- **Timestamps**: Created and updated timestamps

### Admin Features:
- Create, read, update, delete authors
- Deactivate/reactivate authors (soft delete)
- Search and filter by author name, pen name, or writing style
- Pagination support

### Public Features:
- View all authors with pagination and filtering
- Access authors by ID
- No authentication required for public endpoints

### Pre-seeded Authors:
The system comes with 10 pre-configured authors representing diverse writing styles:
1. **Jane Austen** - Witty social commentary and realistic portrayal of 19th-century English society
2. **Ernest Hemingway** - Concise, understated writing style known as the "Iceberg Theory"
3. **Virginia Woolf** - Pioneer of stream-of-consciousness narrative technique
4. **Gabriel García Márquez** - Master of magical realism, blending fantastical elements with realistic settings
5. **Toni Morrison** - Lyrical prose and exploration of African American experience
6. **Haruki Murakami** - Blends magical realism with contemporary Japanese culture
7. **Chimamanda Ngozi Adichie** - Powerful storytelling about Nigerian culture and diaspora
8. **Jorge Luis Borges** - Master of philosophical fiction and magical realism
9. **Sylvia Plath** - Confessional poetry and intense emotional expression
10. **James Joyce** - Pioneer of modernist literature and stream-of-consciousness technique

## Postman Collection

A comprehensive Postman collection is available for testing the Locations API endpoints:

### Import Instructions:
1. Download the Postman collection file: `Amora_Locations_API.postman_collection.json`
2. Open Postman and click "Import"
3. Select the downloaded file
4. Set up environment variables in Postman:
   - `base_url`: Your API base URL (e.g., `http://localhost:3000`)
   - `auth_token`: JWT token for authenticated requests
   - `location_id`: Location ID for testing specific location operations

### Collection Structure:
- **Public Endpoints** - Location queries that don't require authentication
  - Get Location by Slug
  - Get Locations by Category (all 5 categories)
- **Admin Endpoints** - Full CRUD operations requiring authentication
  - Get All Locations (with pagination and search)
  - Get Location by ID
  - Create New Location
  - Update Location
  - Delete Location
  - Toggle Location Status
- **Sample Data** - Pre-configured requests for different location categories
  - Tier-1 City Location
  - Vacation Location
  - International Location
  - Fantasy Location

### Environment Setup:
Create a Postman environment with these variables:
```
base_url: http://localhost:3000
auth_token: (your JWT token)
location_id: (location ID for testing)
```

### Authentication Flow:
1. Use the authentication endpoints to get a JWT token
2. Copy the token from the response and set it as the `auth_token` environment variable
3. All admin requests will automatically include the authorization header

### Available Categories:
- `tier1-cities` - Urban, cosmopolitan settings
- `tier2-cities` - Grounded, relatable settings  
- `vacation-travel` - Adventure and getaway settings
- `international` - Global and cross-cultural settings
- `speculative-fantasy` - Sci-fi and fantasy settings

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