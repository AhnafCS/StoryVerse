# StoryVerse - MERN Stack Application

A full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack

- **MongoDB** - NoSQL database
- **Express.js** - Backend framework
- **React** - Frontend library with TypeScript
- **Node.js** - Runtime environment
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI component library

## Project Structure

```
StoryVerse/
├── server/                 # Backend (Express.js + Node.js)
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── src/                   # Frontend (React)
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── lib/              # Utility functions
│   └── main.tsx          # App entry point
└── package.json          # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas cloud database)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd StoryVerse
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ..
   npm install
   ```

### Environment Setup

#### Backend (.env in server folder)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/storyverse
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
FRONTEND_URL=http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Note:** For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/storyverse?retryWrites=true&w=majority
```

#### Frontend (.env in root folder)

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=StoryVerse
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

### Database Setup

**Local MongoDB:**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Database creates automatically on first run

**MongoDB Atlas:**
1. Create cluster at mongodb.com
2. Create database user
3. Whitelist your IP address
4. Copy connection string to MONGODB_URI

### Running the Application

1. Start the backend server (Terminal 1):
   ```bash
   cd server
   npm run dev
   # or: node server.js
   ```

2. Start the frontend (Terminal 2):
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Troubleshooting

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Or kill all node processes
taskkill /F /IM node.exe
```

**MongoDB connection failed:**
- Verify MongoDB service is running
- Check connection string in .env
- For Atlas: verify IP whitelist and credentials

**CORS errors:**
- Ensure FRONTEND_URL matches your actual frontend port
- Default ports: 8080 (Vite) or 5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Features

- User authentication with JWT
- Responsive design with Tailwind CSS
- Modern UI components with shadcn/ui
- TypeScript for type safety
- RESTful API architecture

## Deployment

This application is designed to be deployed as a full-stack MERN application. Both frontend and backend can be deployed together or separately depending on your hosting preferences.

## License

MIT
