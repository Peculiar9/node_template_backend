import cors from 'cors'
import bodyParser from 'body-parser';
import 'reflect-metadata';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
// import fileUpload from 'express-fileupload';

// initialize controllers
import './Controller/InitController';
import './Controller/auth/AccountController'
import './Controller/auth/KYCController'
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
                // app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
            })

            this.app = server.build();
        } catch (error: any) {
            console.error("App Error: ", error.message);
            this.app.use((req: Request, res: Response, next: NextFunction) => {
                console.log({error})
                res.status(error?.status || 400).json({ success: false, message: 'Failed to initialize the application' });
            })
        }
    }
    private initRoutes() {
        //initialize routes if needed
        //if not leave it alone. Thank you for your understanding~~
    }
    //You can not be too careful
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