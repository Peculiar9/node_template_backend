import { injectable } from "inversify";
import { IKYCUseCase } from "../../Interfaces/UseCases/IKYCUseCase";
import VerificationRepository from "../Repository/VerificationRepository";
import { ResponseMessage } from "../Response/ResponseFormat";
import { IUser } from "../../Entities/Interfaces/UserAndAuth/User";
import UtilityService from "../../../Services/UtilityService";
import UserRepository from "../Repository/UserRepository";
import { VerificationLevel, VerificationStatus } from "../../Enums/VerificationStatus";
import User from "../../Entities/Models/User";
import { AuthenticationError, ValidationError } from "../Error/AppError";
import { PhoneVerificationResponse, UserInfoDTO } from "../../DTOs/KYCDTOs/VerificationDTO";
import FileService from "../../Services/FileService";
import CryptoService from "../../Services/Helper/CryptoService";
import { ObjectId } from "mongodb";
import OTPService from "../../Services/OTPService";
import SMSServices, { SMSData } from "../../Services/SMSServices";
import Verification from "../../Entities/Models/Verification";

@injectable()
export default class KYCUseCase implements IKYCUseCase {
    constructor(
        private readonly _verificationRepository: VerificationRepository,
        private readonly _userRepository: UserRepository,
        private readonly otpService: OTPService,
        protected fileService: FileService
    ) {
    }

    async verifyEmail(token: string, guidIdentifier: string, emailExpiry: string): Promise<any> {
        console.log({ token }, { guidIdentifier });
        const verification: Verification[] =
            (await this._verificationRepository.getVerificationByGuidIdentifier(
                guidIdentifier
            )) || [];
        console.log({ verification });
        //if the verification exists
        if (verification?.length < 1) {
            throw new AuthenticationError(ResponseMessage.INVALID_VERIFICATION);
        }
        //if it is not expired
        const expiry: number = verification[0]?.expiry || 10000000;
        const internalToken: string = verification[0]?.token || "";
        if (expiry <= UtilityService.dateToUnix(new Date())) {
            console.log("Verification has expired")
            throw new ValidationError(
                ResponseMessage.INVALID_VERIFICATION
            );
        }
        const user = await this._userRepository.getUserByPredicate({ verification_id: verification[0]._id }) as User;
        console.log({ user })
        const tokenIsValid = this.confirmTokenValidity(token, internalToken, user?.salt, Number(emailExpiry))
        console.log({ tokenIsValid });
        if (!tokenIsValid) {
            throw new ValidationError(
                ResponseMessage.INVALID_VERIFICATION
            );
        }
        console.log("Valid verification!!!");
        const updateUser: User | null | undefined =
            await this._userRepository.updateUser({
                _id: user?._id,
                verification_progress: VerificationStatus.IN_PROGRESS,
                verification_level: VerificationLevel.email
            });
        return [verification[0], updateUser];
    }

    async sendPhoneVerification(user: IUser, data: PhoneVerificationParameters): Promise<any> {
        if(!data){
            throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE)
        }
        await this.verifyPhoneNumber(data);
        const otp = UtilityService.generate6Digit();
        data.international_phone = data.international_phone?.replace(/\D/g, '');
        const phone = await this.validatePhoneNumber(data);
        console.log({ phone });
        //required verification level is email because you have to do email verification before phone
        await this.validateUserVerificationLevel(user, VerificationLevel.email);
        const message = `Your OTP is ${otp} for the app send it to him Mr Special secret code -> ` + `${process.env.SECRET_PASS}*****`;
        const smsData: SMSData = {
            recipient: phone,
            message: message,
            attributes: {
                datatype: 'string',
                value: 'transactional'
            }
        }
        const smsService = new SMSServices();
        const verificationResult = await smsService.sendVerificationSMS(user, smsData);
        console.log("SMS Sent!!!", { message });
        const otpSent = verificationResult.$metadata.httpStatusCode === 200;
        if (otpSent) {
            const result = await this.otpService.createOtpInstance(user?.verification_id as ObjectId, otp, user?.salt)
            console.log({ result });
            const phoneVerificationResponse = new PhoneVerificationResponse();
            const verificationResult = {
                phone: phone,
                reference: result.reference,
                expiry: result.expiry
            }
            phoneVerificationResponse.create(verificationResult);
            console.log({ phoneVerificationResponse })
            return phoneVerificationResponse;
        }
        else {
            throw new AuthenticationError(ResponseMessage.ERROR_MESSAGE);
        };
    }

    async verifyOTP(data: any, user: User): Promise<any> {
        const userPredicate = {
            _id: user._id,
            country_code: data.country_code,
            international_phone: data.international_phone,
            phone: `${data.country_code}${data.international_phone}`,
            verification_level: VerificationLevel.phone
        }
        const userExists = await this._userRepository.userExists(userPredicate);
        if (userExists) {
            throw new AuthenticationError(ResponseMessage.USER_ALREADY_EXISTS)
        }
        const userSalt = user.salt
        console.log("User Salt: ", { userSalt });
        await this.otpService.validOTP(data?.code, data?.token, userSalt);
        const phoneSaveResult = await this.savePhoneDetailsToDatabase(userPredicate);
        console.log({ phoneSaveResult })
        return phoneSaveResult;
    }
    
    //user details upload for verification
    async saveUserDetails(userData: IUser, data: UserInfoDTO): Promise<any> {
        this.validateUserDetails(data);
        // await this.validateUserVerificationLevel(userData,VerificationLevel.liveness); //comment it out later, after thouroughly testing compareFaces with Driver's license
        const user = new User();
        user.updateUserDetails(data, data?.user?.salt as string)
        console.log({ user })
        const result = await this._userRepository.updateUserByPredicate({ _id: (data?.user as User)._id }, user);
        return result;
    } 


    // private async constructUpdateObjectForBillingInfo(data: any){    

    // }

    // async confirmPhoneVerification(user: IUser, )
    //=====================//
    //   Helper Methods    //
    //=====================//
    // The token is hashed because incase the request is intercepted. 
    private confirmTokenValidity(token: string, internalToken: string, salt: string, expiry: number) {
        const externalToken = CryptoService.hashString(token, salt).toString();
        console.log({ internalToken }, { externalToken });
        const presentDate: number = UtilityService.dateToUnix(new Date());
        console.log({ presentDate }, { expiry });
        if (presentDate >= expiry) {
            console.log("Invalid token");
            return false;
        }
        if (externalToken === internalToken) {
            console.log("Valid verification Token!!!")
            return true
        }
        return false;
    }

    private async savePhoneDetailsToDatabase(data: Partial<User>) {
        const userPhoneUpdateResult = await this._userRepository.updateUser(data);
        console.log({ userPhoneUpdateResult });
        return userPhoneUpdateResult;
    }

    private validateUserDetails(data: any): void {
        if (!data) {
            throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE);
        }
        if (data?.firstName || data?.lastName || data?.licenseNumber || data?.dateOfBirth || data?.licenseExpiryDate || data?.country || data?.state) {
            return;
        }
        throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE);
    }


    //Validate and verify if the number meets the E.164 standard
    private async verifyPhoneNumber(data: PhoneVerificationParameters) {
        const { international_phone, country_code } = data;
        const userExists = await this._userRepository.userExists({
            international_phone: international_phone,
            country_code: country_code,
        });
        if (userExists) {
            throw new AuthenticationError(
                ResponseMessage.USER_ALREADY_EXISTS
            );
        }
        return;
    }

    private async validatePhoneNumber(data: PhoneVerificationParameters) {
        const { international_phone, country_code } = data;
        if(!international_phone || !country_code){
            throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE);
        }
        const cleanedPhoneNumber = international_phone?.replace(/\D/g, '');
        let e164Number: string;
        if ((international_phone as string).length < 10) {
            throw new ValidationError("Invalid Phone Format");
        }
        if (country_code?.startsWith('+')) {
            e164Number = `${country_code}${cleanedPhoneNumber}`;
        }
        else {
            e164Number = `+${country_code}${cleanedPhoneNumber}`;
            // Regular expression pattern to match E.164 format
            const e164Pattern = /^\+?[1-9]\d{1,14}$/;
            // Check if the constructed number matches the E.164 pattern
            const validE164 = e164Pattern.test(e164Number);
            console.log({ validE164 });
            console.log({ e164Number });

            // If the number is not in E.164 format, throw an error
            if (!validE164) {
                throw new ValidationError("Invalid Phone Format");
            }
            return e164Number;
        }
        return e164Number;
        //TODO: Change this logic over time.
    }


    private validateUserVerificationLevel(user: IUser, requiredLevel: VerificationLevel) {
        const verificationStatus = ['email', 'phone', 'selfie', 'license', 'billing-info']
        if (typeof user?.verification_level !== 'number' || !user.verification_level || user?.verification_level < requiredLevel) {
            const nextStepIndex = (user?.verification_level || 0);
            const nextStep = verificationStatus[nextStepIndex] || 'email';
            throw new AuthenticationError(`You are not eligible for this level of authentication, verify ${nextStep} to proceed!!!`);
        }
        return;
    }
  
  
    
   


}

export interface PhoneVerificationParameters {
    international_phone?: string;
    country_code?: string;
    userType?: string;
    userId?: string;
}

