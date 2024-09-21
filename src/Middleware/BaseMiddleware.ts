import { Request, Response, NextFunction } from 'express';
import BaseResponseHandler from './ResponseHandlerMiddleware';
import { injectable } from 'inversify';


@injectable()
abstract class BaseMiddleware extends BaseResponseHandler{
    // public router;
    constructor(){  
        super();
        
    }

    //TODO: Work on these over time
    protected logRequest = (req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method}:: request at ${req.url}`);
        next();
    }

    protected errorHandle = (err: Error, res?: Response) => {
        console.error('Error:', err.stack);
        res?.status(500).json({ error: 'Internal Server Error' });
    }
    


    protected isDevelopmentEnvironment(){
        return (process.env.APP_ENV != 'production' && process.env.APP_ENV != 'prod');
    }
}

export default BaseMiddleware;