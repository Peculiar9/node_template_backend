# Node Express Backend (TypeScript)

This is a backend application built using Node.js, Express, and TypeScript. The project follows a clean architecture design pattern, supporting both MongoDB and SQL (PostgreSQL) for data storage, and includes several reusable components and AWS integrations for efficient deployment and scalability.

## Table of Contents
- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [DevDependencies](#devdependencies)
- [Node Version](#node-version)
- [Contributing](#contributing)

## Overview
This backend service is designed to provide a scalable architecture for different domains, with features including user authentication, KYC verification, utility services, and API integrations. The backend is modular, supporting extensibility and maintainability, making it ideal for teams or projects that aim to grow over time.

The project uses dependency injection via Inversify to promote modularity and easy testing. It also supports both MongoDB and PostgreSQL as databases, enabling flexibility for different use cases.

## Folder Structure
The project follows a clean architecture approach, with each layer clearly defined for modularity and scalability:

```
backend02/
├── dist/                   # Compiled output
│   ├── Middleware/         # Middlewares for handling requests (e.g., Auth, Rate Limiter)
│   ├── Core/               # Core application logic (Types, DTOs, Services, Repositories)
│   ├── Controller/         # Controllers to handle API requests
│   ├── Infrastructure/     # Database connections, APIs, event handling
│   ├── jobs/               # Scheduled tasks and cron jobs
│   └── Services/           # Utility services (e.g., AWS Helper)
├── docs/                   # Project documentation
├── src/                    # Main application source code
│   ├── Controller/         # Controllers for different entities (e.g., Account, KYC)
│   ├── Core/               # Core domain logic (Entities, UseCases)
│   ├── Infrastructure/     # Repository and external integrations
├── Dockerfile              # Docker configuration for containerization
├── README.md               # Project documentation (this file)
├── package.json            # Node dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── yarn.lock               # Yarn lock file
```

### Key Folders
- **`dist`**: Contains compiled JavaScript output for the backend application.
- **`src`**: The core source code, including controllers, core domain entities, and infrastructure.
- **`Middleware`**: Middleware files that handle tasks such as request validation, authentication, rate limiting, and response handling.
- **`Core`**: This folder contains core application logic, including entities, types, DTOs (Data Transfer Objects), services, and use cases. The use cases define the business logic and are essential for maintaining a clean separation of concerns.
- **`Infrastructure`**: Includes MongoDB and SQL connection management, as well as APIs for integration. It also contains repository implementations for data persistence, abstracting the actual database interaction.
- **`Services`**: Utility services that support different parts of the application, such as AWS integration, email services, and other shared utilities. These services are designed to be reusable across different modules.
- **`jobs`**: Contains cron jobs and background tasks that need to run periodically, such as data cleanup, notification dispatching, or monitoring tasks.

## Installation
To set up and run the application locally, you need to have **Yarn** installed. Follow the instructions below to get started:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Navigate into the directory of the cloned repository**
   ```bash
   cd your-repo-name
   ```

3. **Install dependencies**
   ```bash
   yarn install
   ```

4. **Build the application**
   ```bash
   yarn build
   ```

5. **Run the application**
   ```bash
   yarn start
   ```

## Usage
- **Controllers**: Handle the incoming HTTP requests and route them to the appropriate services.
- **Services**: Contains business logic and communicates with repositories to manage data. Examples include `UserService` for user management and `KYCService` for handling KYC verification.
- **Repositories**: Abstract data access logic, whether MongoDB or SQL. The repositories handle data retrieval, updates, and deletions, providing a consistent API for the rest of the application.
- **Middlewares**: Handle cross-cutting concerns like authentication, logging, request validation, and rate limiting. Middleware such as `AuthMiddleware.js` ensures only authenticated users can access specific routes.
- **Jobs**: Periodic tasks, such as sending reminders or updating cache, are implemented here to keep the main application logic clean and efficient.
- **Infrastructure**: This includes database connectivity (MongoDB and PostgreSQL) and external API integration. For example, the `MongoConnectionManager` manages connections to MongoDB, ensuring efficient resource usage.

## Scripts
- **`yarn start`**: Run the compiled JavaScript.
- **`yarn build`**: Compile TypeScript into JavaScript.
- **`yarn dev`**: Start the server in development mode with hot-reloading.
- **`yarn test`**: Run unit tests to verify application functionality.

## Dependencies
- **Express**: A minimal and flexible Node.js web application framework.
- **pg**: PostgreSQL client for Node.js, used for SQL database interactions.
- **Inversify**: For dependency injection, promoting modularity and testability.
- **dotenv**: Loads environment variables from a `.env` file into `process.env`, simplifying configuration management.
- **mongodb**: MongoDB client for Node.js, used for direct MongoDB database interaction without using Mongoose.

## DevDependencies
- **TypeScript**: JavaScript with syntax for types, enabling safer code through static typing.
- **ts-node**: TypeScript execution engine for Node.js, used for running TypeScript files directly.
- **Nodemon**: Monitor for changes during development and automatically restart the server.
- **Jest**: A testing framework for unit and integration tests, ensuring code quality and reliability.

## Node Version
Ensure you are using Node.js version `>=14.x` for compatibility.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.



## Additional Notes
### Dependency Injection
This project leverages **Inversify** for dependency injection to maintain a decoupled architecture. This ensures that components like controllers, services, and repositories can be independently tested and swapped out if needed without altering the overall system.
<br>
See - [Dependency Injection Overview](docs/DEPENDENCY.md) for more.

### API Integrations
The **Infrastructure** layer includes integration with various external APIs. For example, HTTP clients are defined to interact with third-party services, such as AWS for file management. The use of services like `AWSHelper` abstracts away the complexity of AWS integrations, making it easier to work with from other parts of the application.

### Database Management
The project supports both **MongoDB** and **PostgreSQL** as data stores. The **MongoConnectionManager** and **SQLConnectionManager** are responsible for managing connections, ensuring efficient pooling, and providing easy access to database operations. The repositories abstract all data operations, ensuring that switching between databases requires minimal changes to the core logic.

### Error Handling and Logging
Middleware and services include structured error handling and logging, which helps maintain traceability throughout the application's lifecycle. Using tools like **Sentry** for monitoring provides detailed insights into issues, ensuring faster resolution.

### Scheduled Jobs
The **jobs** directory contains files for cron jobs and other scheduled tasks, such as `watcher.jobs.js` and `cron.jobs.js`. These jobs help maintain the application's health, send notifications, or perform routine cleanups. Implementing jobs in a separate module helps keep the main application logic clean and easy to maintain.

This README aims to provide a comprehensive overview of the project structure, installation, and usage guidelines, helping both new developers and contributors understand the architecture and make the best use of the codebase.
