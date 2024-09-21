import { PhoneVerificationParameters } from "../../Application/UseCases/KYCUseCase";
import { UserInfoDTO } from "../../DTOs/KYCDTOs/VerificationDTO";
import { IUser } from "../../Entities/Interfaces/UserAndAuth/User";
import User from "../../Entities/Models/User";

export interface IKYCUseCase {
    verifyEmail(token: string, guidIdentifier: string, emailExpiry: string): Promise<any>; //To be changed to Kyc response dto
    sendPhoneVerification(user: IUser, data: PhoneVerificationParameters): Promise<any>; 
    saveUserDetails(userData: IUser, data: UserInfoDTO): Promise<any>;
    verifyOTP(data: any, user: User): Promise<any>;
}