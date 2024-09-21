
import AWSHelper from "../../Services/AWSHelper";
import UtilityService from "../../Services/UtilityService";
import { ValidationError } from "../Application/Error/AppError";
import UserRepository from "../Application/Repository/UserRepository";
import VerificationRepository from "../Application/Repository/VerificationRepository";
import { ResponseMessage } from "../Application/Response/ResponseFormat";
import Verification from "../Entities/Models/Verification";
import { EmailType } from "../Enums/EmailType";
import CryptoService from "./Helper/CryptoService";

export default class EmailService{
    public awsHelper: AWSHelper;
    private readonly key = process.env.AWS_ACCESS_KEY_ID_EMAIL?.toString() || '';
    private readonly secret = process.env.AWS_SECRET_ACCESS_KEY_EMAIL?.toString() || '';
    private readonly _userRepository: UserRepository;
    private readonly _verificationRepository: VerificationRepository;
    constructor(){
        this.awsHelper = new AWSHelper(this.key, this.secret);
        this._userRepository = new UserRepository();
        this._verificationRepository = new VerificationRepository()
    }


    public async sendVerificationEmail(data: EmailData, userSalt: string, next: string)
    {
       try { 
         const [verificationUrl, emailDataContent] = this.constructVerificationUrl(data, next ?? process.env.HOME_URL);
         this.constructEmailDataObject(data, emailDataContent, verificationUrl);
         const verificationResult = await this.createVerificationObject(emailDataContent, userSalt);
         await this._userRepository.updateUserByPredicate({email: data?.recipient}, {verification_id: verificationResult?._id});
         await this.awsHelper.sendEmail(data, EmailType.VERIFICATION);
         return;
       } catch (error: any) {
          console.log("EmailService::sendVerificationEmail() errormessage => ", error.message);
          throw new ValidationError(ResponseMessage.INVALID_REQUEST_MESSAGE);
       }
    }

    private constructEmailDataObject(data: EmailData, emailDataContent: any, verificationUrl: string): void{
      data.verificationUrl = process.env.HOME_URL + verificationUrl;
      data.token = emailDataContent.token;
      data.guid = emailDataContent?.guid;
    }

    private async createVerificationObject(emailDataContent: any, userSalt: string): Promise<Verification> {
      emailDataContent.token = CryptoService.hashString(emailDataContent?.token, userSalt).toString();
      const verification = new Verification();
      verification.create(emailDataContent);
      const verificationResult = await this._verificationRepository.createVerification(verification) as Verification;
      return verificationResult;
    }

    public async sendWelcomeEmail(data: EmailData)
    {
      try{
        console.log("EmailService::sendWelcomeEmail => emailData: ", data);
        await this.awsHelper.sendEmail(data, EmailType.WELCOME);
      }catch(error: any){
        console.log("EmailService::sendWelcomeEmail() errormessage => ", error.message);
        return;
      }
    }
    
    public async sendWaitlistEmail(data: EmailData)
    {
      try{
        console.log("EmailService::sendWelcomeEmail => emailData: ", data);
        await this.awsHelper.sendEmail(data, EmailType.WAITLIST);
      }catch(error: any){
        console.log("EmailService::sendWelcomeEmail() errormessage => ", error.message);
        return;
      }
    }

    private constructVerificationUrl(data: EmailData, next: string): [any, any]{
        const token = UtilityService.generate6Digit();
        const guid = UtilityService.Guid();
        const validity = UtilityService.dateToUnix(new Date(Date.now() + 10 * 60 * 1000))
        console.log("Email Data: ", {data})
        console.log({token});
        console.log({guid});
        // const url = `verify-email/${token}/${guid}?expires=${validity}&signature=${data.guid}`;
        const url = `rider/on-boarding/${token}/${guid}?expires=${validity}&signature=${data.guid}&next=${next}`;
        return [url, {token, guid}]
    }
}

export interface EmailData {
  recipient: string;
  firstName?: string;
  email?: string;
  guid?: string;
  token?: string;
  validity?: number;
  verificationUrl?: string;
}


