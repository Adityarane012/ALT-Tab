# Internal Network

This project is a complete structure for the Internal Network application, structured with appropriate backend files including models, routes, controllers, middleware, socket handlers, commands, and configuration.

## Project Structure

```
InternalNetwork/
├── config/
│   ├── config.js            # Configuration file
│   └── db.js                # Database connection setup
│
├── controllers/
│   ├── authController.js    # Authentication related logic
│   ├── userController.js     # User related logic
│   └── socketController.js    # Socket related logic
│
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── userRoutes.js        # User routes
│   └── socketRoutes.js      # Socket routes
│
├── models/
│   ├── userModel.js         # User model
│   └── sessionModel.js      # Session model
│
├── middleware/
│   ├── authMiddleware.js     # Middleware for authentication
│   └── errorMiddleware.js     # Error handling middleware
│
├── socketHandlers/
│   └── socketHandler.js     # WebSocket event handling
│
├── commands/
│   └── userCommands.js      # User related commands
│
└── server.js                # Main server entry point
```

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Adityarane012/ALT-Tab.git
   ```
2. **Install Dependencies**:
   ```bash
   cd ALT-Tab
   npm install
   ```
3. **Run the Application**:
   ```bash
   npm start
   ```
