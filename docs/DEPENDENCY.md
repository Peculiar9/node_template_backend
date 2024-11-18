# Dependency Injection and Controller Management in Node Express Backend (TypeScript)

This document provides an overview of how **Inversify** is used for dependency injection in the project and how the controllers are managed in this clean architecture. It also highlights how the architecture differs from the usual Node.js app routing and project structure.

[Back to main README](./README.md)

## Overview
The project uses **Inversify** for dependency injection to ensure that all modules are decoupled and can be tested independently. The **Controller** layer manages incoming HTTP requests and interacts with services using this dependency injection approach. The project structure follows a clean architecture design pattern, which helps maintain separation of concerns and makes each part of the application easy to manage and extend.

## How Dependency Injection is Implemented Using Inversify

### Inversify Basics
- **Inversify** is a lightweight inversion of control (IoC) container for JavaScript and TypeScript applications.
- It allows us to define how dependencies are injected and managed within the application.

### Setting Up Inversify in the Project
The dependency injection setup is managed by using a configuration file (`inversify.config.ts`) that binds interfaces to their implementations, making sure that each component is injected where needed.

#### **inversify.config.ts**
```typescript
import { Container } from 'inversify';
import { TYPES } from './types/types';
import { UserService } from './services/UserService';
import { UserRepository } from './repositories/UserRepository';
import { TransactionManager } from './database/TransactionManager';
import { ConnectionPoolManager } from './database/ConnectionPoolManager';
import { TransactionScope } from './utils/TransactionScope';

const container = new Container();

// Binding services and repositories
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<TransactionManager>(TYPES.TransactionManager).to(TransactionManager);
container.bind<ConnectionPoolManager>(TYPES.ConnectionPoolManager).toConstantValue(ConnectionPoolManager.getInstance({
    max: 10,
    connectionString: process.env.DB_CONNECTION_STRING,
}));
container.bind<TransactionScope>(TYPES.TransactionScope).to(TransactionScope);

export { container };
```
- **`Container`**: The IoC container that holds all the bindings of the project.
- **Binding**: Services, repositories, and other classes are bound to their respective **types** so that they can be injected whenever needed.

### Types for Dependency Injection
The **`TYPES`** file (`types.ts`) is used to create symbols for dependency injection, which ensures that interfaces can be referenced without ambiguity.

#### **types.ts**
```typescript
export const TYPES = {
    UserService: Symbol.for('UserService'),
    UserRepository: Symbol.for('UserRepository'),
    TransactionManager: Symbol.for('TransactionManager'),
    ConnectionPoolManager: Symbol.for('ConnectionPoolManager'),
    TransactionScope: Symbol.for('TransactionScope'),
};
```

### Usage of Dependency Injection in Controllers
Dependency injection ensures that controllers are only concerned with request handling, while the business logic is managed by services. This separation of concerns helps keep the code clean and maintainable.

#### **UserController.ts**
In the following snippet, notice how the controller depends on **UserService**, which is injected using Inversify:

```typescript
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
import { UserService } from '../services/UserService';

@injectable()
export class UserController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService
    ) {}

    async createUser(req, res): Promise<void> {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```
- The **UserController** uses dependency injection to get an instance of **UserService**.
- The **`@inject`** decorator is used to inject the service, ensuring that the controller does not instantiate dependencies directly.

Although, you might see examples like, the below -> it is still a clean way to handle controllers as well, check the App.ts file for the controller config.

```typescript
import { inject } from 'inversify';
import { UserService } from '../services/UserService';

//POST api/v1/auth/pre-signup
@httpPost('/pre-signup')
async presignup(@request() req: Request, @response() res: Response) {
    try {
        const next = req?.query?.next ?? null;
        const responseData = await this._accountUseCase.preSignUpRenter(req?.body, next as string);
        return this.SimpleSuccessResponse(res,
            responseData,
            ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE
        );
    } catch (err: any) {
        console.log("AccountController::presignup error-> ", err.message);
        this.logAndSendSimpleResponse(
            err,
            res,
            401,
        )
    }
}
```

### Differences from Traditional Node.js Routing
In a traditional Node.js application, dependencies are often instantiated directly within the controllers or services. This approach can make it difficult to test components in isolation and leads to tight coupling between modules.

#### **Traditional vs. Inversify**
- **Traditional Approach**:
  - Controllers directly instantiate services or even database clients.
  - Example:
    ```javascript
    const userService = new UserService();
    app.post('/user', (req, res) => {
        userService.createUser(req.body).then(user => res.json(user)).catch(err => res.status(500).send(err));
    });
    ```
- **Inversify Approach**:
  - Dependencies are injected, promoting decoupling and making it easy to swap implementations or mock during testing.
  - This approach follows the **Dependency Inversion Principle**, part of SOLID principles, leading to better maintainability.

### Managing Controllers
Controllers in this project are registered and managed through the **IoC container**. The routing itself is handled by registering the controllers with Express and using the container to resolve dependencies.

#### **Example of Registering a Controller**
```typescript
import { Router } from 'express';
import { container } from '../inversify.config';
import { UserController } from '../controllers/UserController';
import { TYPES } from '../types/types';

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

// Define routes
router.post('/user', (req, res) => userController.createUser(req, res));

export default router;
```
- The **IoC container** provides an instance of **UserController** that is already injected with the required dependencies.
- This method allows for easy scaling, as new controllers or routes can be added by simply updating the bindings and the router configuration.

## Summary
This document provides an overview of how **Inversify** is used to implement dependency injection in this backend project, along with how controllers are managed differently compared to a traditional Node.js setup. The main differences include better separation of concerns, easy testability, and adherence to clean architecture principles, which contribute to a more maintainable and scalable codebase.
