import { controller, httpDelete, httpGet, httpPost, request, response } from "inversify-express-utils";
import { Response, Request } from "express";
import BaseController from "../BaseController";
import { API_PATH } from "../../Core/appConfig";
// import { IAccountUseCase } from "../../Core/Interfaces/UseCases/IAccountUseCase";
import { inject } from "inversify";
import AccountUseCase from "../../Core/Application/UseCases/AccountUseCase";
import { AdminCreateUserDTO, PreSignUpResponseDTO } from "../../Core/DTOs/UserDTOs/CreateUserDTO";
import { ResponseMessage } from "../../Core/Application/Response/ResponseFormat";
import { AuthMiddleware } from "../../Middleware/Authentication/AuthMiddleware";
import { UserLoginDTO, UserLoginResponseDTO } from "../../Core/DTOs/UserDTOs/AuthDTO";
// import User from "../../Core/Entities/Models/User";
// import ResponseFormat, { ResponseMessage } from "../../Core/Application/Response/ResponseFormat";

@controller(`/${API_PATH}/auth`)
class AccountController extends BaseController {
    constructor(
        @inject('IAccountUseCase') private readonly _accountUseCase: AccountUseCase) {
        super();
    }

    //====================//
    // Pre Authentication //
    //===================//

    //GET api/v1/auth/
    @httpGet('/')
    async auth() {
        console.log("users");
        return "users";
    }

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


    @httpPost('/grant-priviledges')
    async grantRenterPriviledges(@request() req: Request, @response() res: Response){
        try{
            const body = req?.body;
            const result = await this._accountUseCase.grantRenterPriviledges(body?.email, body?.password);
            const response = new UserLoginResponseDTO();
            response.create(result);
            this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        }catch(err: any){
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
            )
        }
    }

    @httpPost('/host-pre-signup')
    async presignuphost(@request() req: Request, @response() res: Response) {
        try {
            const next = req?.query?.next ?? null;
            const responseData = await this._accountUseCase.preSignUpHost(req?.body, next as string);
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

    //POST api/v1/auth/resend-verification-email
    @httpPost('/resend-verification-email', AuthMiddleware.preKycAuthenticate)
    async resendVerificationEmail(@request() req: Request, @response() res: Response) {
        try {
            // const userCreateRequestBody: PreSignUpUserDTO = req.body;
            //TODO: Proper implementation for this on GSB-163
            const user = req.user;
            const { next } = req.query;
            console.log({ user });
            const responseData = new PreSignUpResponseDTO();
            responseData.create(user);
            await this._accountUseCase.verificationEmailSenderHandler(user, next as string);
            return this.SimpleSuccessResponse(res, responseData, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
            )
        }
    }

    //POST api/v1/auth/refresh
    @httpPost('/refresh', AuthMiddleware.refreshAuthenticate)
    async refreshToken(@request() req: Request, @response() res: Response) {
        try {
            const user = req?.user;
            console.log({ user });
            const response = await this._accountUseCase.refreshToken(user);
            return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
            )
        }
    }

    //POST api/v1/auth/refresh
    @httpPost('/session-details')
    async authSessionDetails(@request() req: Request, @response() res: Response) {
        try {
            const { token } = req.query;
            const result = await this._accountUseCase.getUserDetails(token as string);
            const response = new UserLoginResponseDTO()
            response.create(result);
            return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
            )
        }
    }


    //======================//
    // User Authentication //
    //=====================//

    //POST api/v1/auth/login
    @httpPost('/login')
    async login(@request() req: Request, @response() res: Response) {
        try {
            const userLoginRequestDTO: UserLoginDTO = req.body;
            console.log({ userLoginRequestDTO })
            const response = await this._accountUseCase.login(userLoginRequestDTO);
            return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
                this.responseMessage.INVALID_LOGIN
            )
        }
    }

    //POST api/v1/auth/login
    @httpDelete('/user/remove')
    async removeUser(@request() req: Request, @response() res: Response) {
        try {
            const userRemoveBody = req.body;
            console.log({ userRemoveBody })
            const response = await this._accountUseCase.removeUser(userRemoveBody?.email);
            return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
                this.responseMessage.INVALID_LOGIN
            )
        }
    }
    //  @httpPost('/login')
    //  async completeLogin(@request() req: Request, @response() res: Response){
    //     try{
    //         const userCreateRequestBody: PreSignUpUserDTO = req.body;
    //         const response = await this._accountUseCase.presignUpUserCreate(userCreateRequestBody);
    //         return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
    //     }catch(err: any){
    //         console.log("AccountController::presignup error-> ", err.message);
    //         this.logAndSendSimpleResponse(
    //             err,
    //             res, 
    //             401,
    //             this.responseMessage.REQUIRED_FIELD,
    //         )
    //     }
    // }




    //======================//
    // Admin Authentication //
    //=====================//

    //Protected route
    //POST api/v1/admin/signup
    @httpPost('/admin/signup')
    async adminCreate(@request() req: Request, @response() res: Response) {
        try {
            const userCreateRequestBody: AdminCreateUserDTO = req.body;
            const response = await this._accountUseCase.adminUserCreate(userCreateRequestBody);
            return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
                this.responseMessage.REQUIRED_FIELD,
            )
        }
    }

    //POST api/v1/admin/signup
    @httpPost('/admin/login')
    async adminLogin(@request() req: Request, @response() res: Response) {
        try {
            const userCreateRequestBody: AdminCreateUserDTO = req.body;
            const response = await this._accountUseCase.adminUserCreate(userCreateRequestBody);
            return this.SimpleSuccessResponse(res, response, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        } catch (err: any) {
            console.log("AccountController::presignup error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
                this.responseMessage.REQUIRED_FIELD,
            )
        }
    }

    @httpPost('/add-payment-method')
    async addPaymentMethod(@request() req: Request, @response() res: Response) {
        // Renter-specific payment method addition logic
        console.log("");

        // Payment method:
        // model => {
        //     _id,

        // }
    }

    //===========================//
    // OAuth and Authorization //
    //==========================//

    //Google OAuth
    //Apple OAuth
}

export default AccountController;
