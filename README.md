# Node Express Backend (TypeScript)

This is a Node.js backend application built using Express and TypeScript. The application is designed to provide a robust and scalable backend architecture, using several libraries and AWS services. It supports TypeScript for type safety and efficient development.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [DevDependencies](#devdependencies)
- [Node Version](#node-version)
- [Contributing](#contributing)

## Installation

To get started, you need to have **Yarn** installed. Follow the instructions below to set up and run the application:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   
2. **Navigate into the directory of cloned repository**
   ```bash
   cd your-repo-name
3. **Install dependencies**
   ```bash
   yarn install or yarn
4. **Build app**
   ```bash
   yarn build
5. **Build app**
   ```bash
   yarn start


## Architecture

This application follows the **Clean Architecture** approach and utilizes the **Repository Pattern** for data access. This design ensures that the codebase is modular, scalable, and easy to maintain. Below is an overview of how the architecture is structured:

### 1. Layers of the Architecture

The application is divided into multiple layers to enforce separation of concerns:

- **Core/Domain Layer**: This contains the core business logic and entities (e.g., models and business rules). It is independent of any frameworks or external libraries.
- **Application Layer**: Contains use cases or services that coordinate the flow of information between the domain layer and the outer layers. This layer also defines interfaces for the repository.
- **Infrastructure Layer**: Responsible for implementing the interfaces defined in the application layer, such as data access (repositories), external APIs, or AWS services.
- **Presentation/Adapter Layer**: Handles HTTP requests and responses, acting as the interface between users and the application. It uses controllers and routes to interact with the application layer.

### 2. Repository Pattern for Data Access

To separate the business logic from data access details, the **Repository Pattern** is used. This allows for flexibility in how data is stored and retrieved, making it easier to switch database implementations or integrate new data sources without modifying the core business logic.

- **Repositories**: Defined as interfaces in the application layer and implemented in the infrastructure layer (e.g., MongoDB repository, SQL repository).
- **Database Access**: Each repository implementation is responsible for interacting with the database using TypeORM, Mongoose, or the native SDKs (e.g., AWS SDK for S3 operations).

### 3. Dependency Injection

The project leverages **InversifyJS** for dependency injection to decouple components and make testing easier. Dependencies like repositories, services, and controllers are injected into components that need them, ensuring modularity.

### 4. Folder Structure

The project follows a structured layout that reflects the architecture:

Controller <br>
Core<br>
Infrastructure<br>
Middleware<br>
Services<br>
tests<br>

### 5. Detailed Documentation

For an in-depth explanation of each component, patterns, and design principles, refer to the [architecture documentation](docs/ARCHITECTURE.md).

---

## Additional Documentation

You can find more detailed information about specific components and features in the `docs` folder:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)

