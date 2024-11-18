# API Management in Node Express Backend (TypeScript)

This document provides an overview of the API management approach used in this Node Express backend project. The clean architecture of this project makes it easy to maintain, extend, and test the different API endpoints. Below, we describe how API routes are organized and integrated within the backend using a combination of **Inversify** for dependency injection, Express for routing, and TypeScript for type safety.

[Back to main README](../README.md)

## Overview
The backend is built using **Express**, a minimal and flexible Node.js web framework, and **Inversify**, which is used for dependency injection. This approach helps manage services, repositories, and controllers cleanly and independently. This results in a project structure where responsibilities are clearly separated, making it easy to test and modify individual components.

The API endpoints are handled by controllers, which themselves interact with services. The routing is defined in such a way that each controller is decoupled from the specifics of Express, making the overall architecture cleaner and more maintainable.

## API Routing

### Defining Routes in Express
Routes are defined by linking the endpoints to specific controller methods. Here is an example of how the **UserController** is linked to the relevant route:

#### **routes/user.route.ts**
```typescript
import { Router } from 'express';
import { container } from '../inversify.config';
import { UserController } from '../controllers/UserController';
import { TYPES } from '../types/types';

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

// Define routes
router.post('/user', (req, res) => userController.createUser(req, res));
router.get('/user/:id', (req, res) => userController.getUser(req, res));

export default router;
```
- Here, **`Router`** is used to define the HTTP routes for the user entity.
- The **Inversify container** provides an instance of **UserController** with all the dependencies already injected, ensuring that the controller is ready to be used without any manual instantiation.

#

### Advanced Integration Using InversifyExpressServer
The **App.ts** file in this project uses a slightly advanced setup involving **InversifyExpressServer** from `inversify-express-utils`. This setup allows us to integrate the **IoC container** directly with Express, ensuring that all dependencies are resolved automatically, including controllers, services, and middleware.

#### **App.ts**
```typescript
import cors from 'cors';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

// Initialize controllers
import './Controller/InitController';
import './Controller/auth/AccountController';
import './Controller/auth/KYCController';
import DIContainer from './Core/DIContainer';

import express, { Response, Request, NextFunction } from 'express';
import path from 'path';

class App {
    public app: any;
    constructor() {
        this.app = express();
        this.initMiddleWares();
        this.initRoutes();
        this.handleErrors();
    }

    private initMiddleWares() {
        try {
            const container = new Container();
            const diContainerBuilder = new DIContainer(container);
            diContainerBuilder.resolveDependencies();
            const server = new InversifyExpressServer(container);

            server.setConfig((app: any) => {
                app.use(express.json());
                app.use(bodyParser.json());
                app.use(bodyParser.urlencoded({ extended: false }));
                app.set('view engine', 'ejs');
                app.set('views', path.join(__dirname, '..', 'src', 'static'));
                app.use(cors());
            });

            this.app = server.build();
        } catch (error: any) {
            console.error("App Error: ", error.message);
            this.app.use((req: Request, res: Response, next: NextFunction) => {
                console.log({ error });
                res.status(error?.status || 400).json({ success: false, message: 'Failed to initialize the application' });
            });
        }
    }

    private initRoutes() {
        // Initialize additional routes if needed
    }

    private handleErrors() {
        this.app.use(this.errorHandler);
    }

    private errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(err.status || 400).json({
            success: false,
            message: err.message || 'Internal Server Error',
        });
    };
}

export default new App().app;
```
- **InversifyExpressServer**: This server class integrates Express and the Inversify IoC container, ensuring that all controllers registered with the container are automatically recognized by the Express server.
- **Middleware**: Middlewares are configured using the `server.setConfig()` function, which provides an opportunity to customize the Express app before the server is built.
- **DIContainer**: A custom **DIContainer** is used to resolve dependencies in the container, enhancing maintainability and simplifying the dependency injection setup.


#### **app.ts**
```typescript
import express from 'express';
import userRoutes from './routes/user.route';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// Route setup
app.use('/api', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```
- **Middleware**: Middleware such as `body-parser` is added to handle request bodies.
- **Route setup**: The routes are mounted at `/api`, ensuring that the user routes are accessible at endpoints like `/api/user`.

## Example of Controller Implementation

### UserController
The **UserController** is designed to manage user-related endpoints such as creating a user or retrieving user information. Controllers interact with services that contain the core business logic.

#### **UserController.ts**
```typescript
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
import { UserService } from '../services/UserService';
import { Request, Response } from 'express';

@injectable()
export class UserController {
    constructor(
        @inject(TYPES.UserService) private userService: UserService
    ) {}

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```
- **Injection of Services**: The **UserService** is injected into the controller using **Inversify**, ensuring that the controller is focused solely on handling HTTP requests.
- **Handling HTTP Responses**: Methods like **`createUser`** and **`getUser`** handle different types of responses, such as success (`201`, `200`) and error (`404`, `500`).

### Another Example Using Decorators for API Routes
In some cases, you might find a more expressive approach where decorators are used to define API routes directly in the controller. This method is commonly facilitated by libraries like **routing-controllers**.

#### **Decorated Controller Example**
```typescript
import { httpGet, httpPost, request, response } from 'routing-controllers';
import { Request, Response } from 'express';

export class KYCController {
    @httpPost('/verify-email/:token/:guid')
    async verifyEmail(@request() req: Request, @response() res: Response) {
        try {
            const { token, guid } = req.params;
            const query = req.query;
            console.log("VERIFY EMAIL");
            const [verification, updatedUser] = await this._verificationUseCase.verifyEmail(token, guid, query?.expires as string);
            console.log('verification: ', verification);
            const response = new UserLoginResponseDTO();
            response.create(updatedUser);
            return res.status(200).json({ message: 'Email verified successfully', user: updatedUser });
        } catch (err: any) {
            console.log("KYCController::verifyEmail error-> ", err.message);
            return res.status(401).json({ message: 'Failed to verify email' });
        }
    }
}
```
- **Decorators**: The use of `@httpPost` and `@httpGet` provides a cleaner way to declare routes directly on controller methods, reducing boilerplate code and improving readability.
- **Dependency Injection**: Even with decorators, dependency injection remains consistent, ensuring the controller focuses purely on request handling.

## Summary
This document provides an overview of how API management is handled in the Node Express backend project using TypeScript, Express, and Inversify. The architecture emphasizes clean separation of concerns by using dependency injection and controller-based routing.

The approach involves:
- Using **Express** for defining routes and managing API endpoints.
- Leveraging **Inversify** for injecting dependencies like services and repositories.
- Maintaining a clean, modular architecture that is easy to extend, test, and maintain.

This setup ensures that APIs are scalable, maintainable, and follow the best practices of clean architecture, resulting in an easy-to-understand and easy-to-use codebase for developers.
