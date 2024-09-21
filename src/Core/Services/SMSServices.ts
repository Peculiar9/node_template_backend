import AWSHelper from "../../Services/AWSHelper";
// import UtilityService from "../../Services/UtilityService";
// import UserRepository from "../Application/Repository/UserRepository";
// import VerificationRepository from "../Application/Repository/VerificationRepository";
// import { ResponseMessage } from "../Application/Response/ResponseFormat";
import { IUser } from "../Entities/Interfaces/UserAndAuth/User";
import { SMSType } from "../Enums/SMSType";

export default class SMSServices {
  private readonly key = process.env.AWS_ACCESS_KEY_ID?.toString() || "";
  private readonly secret = process.env.AWS_SECRET_ACCESS_KEY?.toString() || "";
  private awsHelper: AWSHelper;
  // private readonly _verificationRepository: VerificationRepository;
  constructor() {
    this.awsHelper = new AWSHelper(this.key, this.secret);
    // this._verificationRepository = new VerificationRepository();
  }
  

  // this is a bit tightly coupled because it supposed to be specific to 
  // text messages but it isn't
  public async sendVerificationSMS(user: IUser, data: SMSData) {
    try {
      // const verificationId = user?.verification_id?.toString() || "";
      // const verification = await this._verificationRepository.getVerificationById(verificationId);
      // const isValid = this.confirmValidity(verification?.expiry || 0);
      // if (!verification || !isValid) {
      //   throw new Error(ResponseMessage.INVALID_VERIFICATION);
      // }
      console.log("Gotten to the send SMS verification part: ");
      const smsResult = await this.awsHelper.sendSMS(data, SMSType.SINGLE);
      console.log({ smsResult });
      return smsResult;
    } catch (error: any) {
      console.log("SMSServices::sendVerificationSMS() => ", error.message);
    }
  }
 
  //Confirmation SMS
  //Order Confirmation SMS
  //Promotion SMS

  //=====================//
  //   Helper Methods    //
  //=====================//

  // private confirmValidity(expiry: number): boolean {
  //   const currentDate = UtilityService.dateToUnix(new Date());
  //   if (expiry <= currentDate) {
  //     return false;
  //   }
  //   return true;
  // }
}

export interface SMSData {
  recipient: string; //phone of user using the E.164 format
  message: string;
  attributes?: any;
}