// import { User } from "@sentry/node";
import { PreSignUpResponseDTO } from "../../DTOs/UserDTOs/CreateUserDTO";
import User from "../../Entities/Models/User";
import { EmailData } from "../../Services/EmailService";

export interface IAccountUseCase{
    // userInit: (data: any)=>void;
    getUserList: () => any; 
    login: (data: any) => Promise<any>;
    resendEmail: (data: EmailData) => Promise<boolean>;
    refreshToken: (user: Partial<User>) => Promise<PreSignUpResponseDTO>;
}
