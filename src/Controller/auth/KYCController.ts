
import { controller, httpGet, httpPost, request, response } from "inversify-express-utils";
import { Request, Response, } from "express";
import BaseController from "../BaseController";
import { API_PATH } from "../../Core/appConfig";
import { AuthMiddleware } from "../../Middleware/Authentication/AuthMiddleware";
import KYCUseCase, { PhoneVerificationParameters } from "../../Core/Application/UseCases/KYCUseCase";
import { inject } from "inversify";
import { ResponseMessage } from "../../Core/Application/Response/ResponseFormat";
import { UserDetailsResponse, UserInfoDTO } from "../../Core/DTOs/KYCDTOs/VerificationDTO";
import multerMiddleware from "../../Middleware/MulterMiddleware";
import { UserLoginResponseDTO } from "../../Core/DTOs/UserDTOs/AuthDTO";
import { USER } from "../../Core/Enums/UserType";
import { IUser } from "../../Core/Entities/Interfaces/UserAndAuth/User";
import { RateLimiter } from "../../Middleware/RateLimiterMiddleware";
@controller(`/${API_PATH}/kyc`, RateLimiter.rateLimitingPipeline('', { windowMs: 5, maxRequests: 30}))
class KYCController extends BaseController {
    
    constructor(@inject('IKYCUseCase') private readonly _verificationUseCase: KYCUseCase){
        super();
    }

    // Email Verification
  
    //GET api/v1/verify-email/{token}/{guid}
    @httpGet('/verify-email/:token/:guid')
     async verifyEmail(@request() req: Request, @response() res: Response){
        try{
            const {token, guid} = req.params;
            const query = req.query;
            console.log("VERIFY EMAIL");
            const [verification, updatedUser] = await this._verificationUseCase.verifyEmail(token, guid, query?.expires as string);
            console.log('verification: ', verification);
            const response = new UserLoginResponseDTO();
            response.create(updatedUser);
            return this.SimpleSuccessResponse(
                 res,
                 response,
                 ResponseMessage.SUCCESSFUL_EMAIL_VERIFICATION_MESSAGE
            );
        }
        catch(err: any){
            console.log("KYCController::verifyEmail error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
                this.responseMessage.FAILED_EMAIL_VERIFICATION
            )
        }
    }

    // Mobile Number Verification
    // POST api/v1/kyc/mobile-verification/init
    @httpPost('/pre-signup/phone', AuthMiddleware.preKycAuthenticate)
    async initMobileVerification(@request() req: Request, @response() res: Response){
        try{
            const user = req?.user;
            const body = req?.body; 
            const data: PhoneVerificationParameters = {
                international_phone: body?.international_phone,
                country_code: body?.country_code,
                userType: USER.RENTER
            }
            const result = await this._verificationUseCase.sendPhoneVerification(user, data);
            return this.SimpleSuccessResponse(
                res,
                result,
                ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE
            );
        }catch(err: any){
            console.log("KYCController::initMobileVerification error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res, 
                401,
            )
        }
    }

    @httpPost('/verification/phone/resend', AuthMiddleware.preKycAuthenticate)
    async resendMobileVerification(@request() req: Request, @response() res: Response){
        try{
            return "response";
        }catch(err: any){
            console.log("KYCController::resendMobileVerification error-> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res, 
                401,
                this.responseMessage.REQUIRED_FIELD,
            )
        }
    }

    @httpPost('/verify-otp', 
        RateLimiter.rateLimitingPipeline('', { windowMs: 3, maxRequests: 5 }),
        AuthMiddleware.preKycAuthenticate)
    async verifySignUpPhone(@request() req: Request, @response() res: Response){
       try{
           const body = req.body;
           const user = req?.user;
           console.log("VERIFY PHONE: ", {body});
           const response = await this._verificationUseCase.verifyOTP(body, user);
           const verificationResponse = new UserDetailsResponse();
           verificationResponse.create(response);
           return this.SimpleSuccessResponse(
               res,
               verificationResponse,
               ResponseMessage.SUCCESSFUL_PHONE_VERIFICATION_MESSAGE
           );
       }
       catch(err: any){
           console.log("KYCController::verify-otp error-> ", err.message);
           this.logAndSendSimpleResponse(
               err,
               res, 
               401,
               this.responseMessage.FAILED_PHONE_VERIFICATION,
           )
       }
   }

    // @httpPost('user-details', AuthMiddleware.preKycAuthenticate) // replace with this after testing
    @httpPost('/user-details', AuthMiddleware.preKycAuthenticate)
    async userDetails(@request() req: Request, @response() res: Response){
        try{
            console.log(req.body)
            console.log(req.body.user)
            const userDetails: UserInfoDTO = req.body;
            userDetails.user = req?.user;
            //handle user details upload
            const response = await this._verificationUseCase.saveUserDetails(userDetails?.user as IUser, userDetails);
            //construct response
            
            const successResponse: UserDetailsResponse = new UserDetailsResponse();
            successResponse.create(response);

            this.SimpleSuccessResponse(res, successResponse, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
        }catch(err: any){
            console.log("KYCController::userDetails() error -> ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                401,
                this.responseMessage.INVALID_REQUEST
            )
        }
    }

    
    @httpPost('/liveness-check', AuthMiddleware.preKycAuthenticate, multerMiddleware.fields([{ name: 'selfie' }, { name: 'license' }]))
    async livenessCheck(@request() req: Request, @response() res: Response){
        try{
            const user = req.user;
            const photos = req.files as { [fieldname: string]: Express.Multer.File[] };
            console.log({ photos }, {user});
            this.SimpleSuccessResponse(res, {}, ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE);
            
        }catch(err: any){
            console.log("KYCController::upload-selfie() -> error: ", err.message);
            this.logAndSendSimpleResponse(
                err,
                res,
                400,
                err.message ?? this.responseMessage.INVALID_REQUEST
            )
        }
        
    }


    @httpPost('/', AuthMiddleware.preKycAuthenticate)
    async payoutInit(@request() req: Request, @response() res: Response){
        
    }
    // Payment Method
}


export default KYCController;

// TODO: Driver's license
// Country
// State
// Firstname
// Middlename
// Lastname
// License number