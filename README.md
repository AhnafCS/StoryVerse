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
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
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

Create environment files:

**Backend (.env)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/storyverse
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

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
