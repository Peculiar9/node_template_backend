import { ResponseDataInterface, ResponseMessage } from "../../Core/Application/Response/ResponseFormat";
import { IUser } from "../../Core/Entities/Interfaces/UserAndAuth/User";
// import { VerificationStatus } from "../../Core/Enums/VerificationStatus";
import AuthServices from "../../Core/Services/AuthServices";
import UtilityService from "../../Services/UtilityService";
import BaseMiddleware from "../BaseMiddleware";
import { Request, Response, NextFunction } from "express";
import CryptoJS from 'crypto-js';
import { AuthenticationError, ForbiddenError } from "../../Core/Application/Error/AppError";
import { USER } from "../../Core/Enums/UserType";
import { VerificationLevel, VerificationStatus } from "../../Core/Enums/VerificationStatus";
export class AuthMiddleware extends BaseMiddleware {
    constructor() {
        super();
    }


    //TODO: There should be an authentication parameter that checks for a blacklist flag
    //e.g throw the rating and the review feature. Like how many times has the user been rated so or has bashed the car. Or a flag to do something when the user has completed a trip number 
    //...or number of trips
    public static authenticateHost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req?.headers.authorization;
            console.log({ authHeader });

            if (!authHeader) {
                throw new AuthenticationError("Auth header does not exist!!!");
            }

            const token: any = authHeader.split(' ')[1].toString();
            this.verifyToken(token)

            const { payload } = this.parseJWT(token);
            this.validatePriviledges(USER.HOST, payload);
            const authService = new AuthServices();
            console.log(authService);
            console.log({payload})
            const userId = payload?.data?.sub;
            console.log({userId})
            const user: IUser | null | undefined = await authService?.getUserFromToken(userId);

            //TODO: an extra section for monitoring the user role and where they can access
            console.log("User from Token: ", { user });
            if (!user) {
                console.log("AuthMiddleware::authenticate() failed authentication");
                throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
            }

            (req as any).user = user;
            //TODO: Uncomment this when we have completed the flow.
            // const { verification_progress } = user;
            // if (verification_progress !== VerificationStatus.COMPLETED) {
            //     throw new Error("User is not verified, proceed to verification!");
            // }
            next();
        } catch (error: any) {
            const responseData: ResponseDataInterface = {
                success: false,
                message: error.message ?? ResponseMessage.INVALID_REQUEST_MESSAGE,
                data: {},
                error_code: 0
            }
            return res.status(401).json(responseData);
        }
    }

    public static authenticate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req?.headers.authorization;
            console.log({ authHeader });

            if (!authHeader) {
                throw new AuthenticationError("Auth header does not exist!!!");
            }

            const token: any = authHeader.split(' ')[1].toString();
            this.verifyToken(token)

            const { payload } = this.parseJWT(token);
            this.validatePriviledges(USER.RENTER, payload);
            const authService = new AuthServices();
            console.log(authService);
            console.log({payload})
            const userId = payload?.data?.sub;
            console.log({userId})
            const user: IUser | null | undefined = await authService?.getUserFromToken(userId);

            //TODO: an extra section for monitoring the user role and where they can access
            console.log("User from Token: ", { user });
            if (!user) {
                console.log("AuthMiddleware::authenticate() failed authentication");
                throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
            }

            (req as any).user = user;
            //TODO: Uncomment this when we have completed the flow.
            // const { verification_progress } = user;
            // if (verification_progress !== VerificationStatus.COMPLETED) {
            //     throw new Error("User is not verified, proceed to verification!");
            // }
            next();
        } catch (error: any) {
            const responseData: ResponseDataInterface = {
                success: false,
                message: error.message ?? ResponseMessage.INVALID_REQUEST_MESSAGE,
                data: {},
                error_code: 0
            }
            return res.status(401).json(responseData);
        }
    }

    public static preKycAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req?.headers.authorization;
            console.log({ authHeader });

            if (!authHeader) {
                throw new AuthenticationError("Auth header does not exist!!!");
            }

            const token: string | undefined = authHeader.split(' ')[1].toString();
            this.verifyToken(token)
            const { payload } = this.parseJWT(token);
            const authService = new AuthServices();
            console.log("AuthMiddleware authservice", authService);
            const user = await authService.getUserFromToken(payload?.data?.sub);
            if (!user) {
                console.log("AuthMiddleware::preKycAuthenticate() => error: Invalid token");
                throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
            }
            (req as any).user = user;
            next();
        } catch (error: any) {
            console.log("AuthMiddleware::preKycAuthenticate() => error", error)
            const responseData: ResponseDataInterface = {
                success: false,
                message: error.message ?? ResponseMessage.INVALID_REQUEST_MESSAGE,
                data: {},
                error_code: 0
            }
            return res.status(401).json(responseData);
        }
    }

    //TODO: rewrite this to accomodate expired JWT
    public static refreshAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req?.headers.authorization;
            console.log({ authHeader });

            if (!authHeader) {
                throw new AuthenticationError(ResponseMessage.INVALID_AUTH_HEADER_MESSAGE);
            }

            const token: string | undefined = authHeader.split(' ')[1].toString();
            const { payload } = this.parseJWT(token);
            const authService = new AuthServices();
            console.log("AuthMiddleware authservice", authService);
            const user = await authService.getUserFromToken(payload?.data?.sub);
            if (!user) {
                console.log("AuthMiddleware::refreshAuthenticate() => error: Invalid token");
                throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
            }
            if(user.verification_level !== VerificationLevel.billingInfo && user.verification_progress !== VerificationStatus.COMPLETED)
            {
                throw new ForbiddenError(ResponseMessage.INSUFFICIENT_PRIVILEDGES_MESSAGE);
            }
            (req as any).user = user;

            next();
        } catch (error: any) {
            const responseData: ResponseDataInterface = {
                success: false,
                message: error.message ?? ResponseMessage.INVALID_REQUEST_MESSAGE,
                data: {},
                error_code: 0
            }
            return res.status(401).json(responseData);
        }
    }


    //Helper Methods
    private static verifyToken(token: string) {
        this.verifySignature(token);
        this.validateTokenExpiry(token);
    }

    private static parseJWT(token: string) {
        const secret = process.env.SECRET_KEY;
        console.log("secret: ", secret);
        const [headerBase64, payloadBase64, signature] = token.split('.');
        const header = JSON.parse(UtilityService.base64UrlDecode(headerBase64));
        const payload = JSON.parse(UtilityService.base64UrlDecode(payloadBase64));
        return { header, payload, signature };
    }

    // TODO: Restructure this later to avoid code repeat.
    private static verifySignature(token: string): boolean | undefined {
        try {
            const { header, payload } = this.parseJWT(token);

            const algorithm = JSON.stringify(header?.alg);
            const [headerBase64, payloadBase64, signatureBase] = token.split('.');
            const dataToVerify = `${headerBase64}.${payloadBase64}`;
            console.log({ dataToVerify })
            console.log({ payload })
            console.log({ signatureBase })
            console.log({ header })
            console.log({ algorithm })

            const secret = process.env.SECRET_KEY as string;
            console.log("Secret from AuthMiddleware: ", { secret })
            if (!secret) { console.log("AuthMiddleware::verifySignature error => secret does not exist "); throw new AuthenticationError(ResponseMessage.INVALID_TOKEN) };
            const expectedSignature = CryptoJS.HmacSHA256(dataToVerify, secret).toString();
            const isValid = expectedSignature !== signatureBase;
            if (!isValid) throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
            return isValid as boolean;

        } catch (error: any) {
            console.log("AuthMiddleware::verifySignature error =>  ", error.message);
            throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
        }
    }

    private static validateTokenExpiry(token: string): void {
        const { payload } = this.parseJWT(token);
        const currentTime = UtilityService.dateToUnix(new Date());
        const isExpired = payload.exp <= currentTime;
        if (isExpired) throw new AuthenticationError(ResponseMessage.INVALID_TOKEN);
    }
  
    private static validatePriviledges(userType: USER, payload: any){
        // userType is the user type or role to search for or validate
       
        const isValidRole = (payload?.data?.roles as string[]).includes(userType);
        if(!isValidRole){
            throw new ForbiddenError(ResponseMessage.INSUFFICIENT_PRIVILEDGES_MESSAGE);
        }
        return;
    }


}

