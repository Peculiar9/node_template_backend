import { ObjectId } from "mongodb";
import UtilityService from "../../Services/UtilityService";
import CryptoService from "./Helper/CryptoService";
import VerificationRepository from "../Application/Repository/VerificationRepository";
import { injectable } from "inversify";
import Verification from "../Entities/Models/Verification";
import { AuthenticationError } from "../Application/Error/AppError";
import { ResponseMessage } from "../Application/Response/ResponseFormat";


@injectable()
export default class OTPService {

    constructor(private _verificationRepository: VerificationRepository) { }
    public async createOtpInstance(verificationId: ObjectId, otp: string, salt: string): Promise<Verification> {
        console.log("OTP Code: ", otp);
        const verification = {
            otp: {
                code: CryptoService.hashString(otp, salt),
                expiry: UtilityService.dateToUnix(new Date(Date.now() + 10 * 60 * 1000)) //expires in 10mins
            },
            reference: UtilityService.Guid()
        }

        const predicate = { _id: verificationId }
        const result: Verification = await this._verificationRepository.updateAsync(predicate, verification) as Verification;   
        return result;
    }

    public async validOTP(code: string, token: string, salt: string){
        const verification = (await this._verificationRepository.getVerificationByGuidIdentifier(token)) as Verification[];
        console.log("Got here!!!");
        const hashedToken = CryptoService.hashString(code, salt);
        console.log("Got here!!!");
        const verificationToken = verification[0]?.otp.code;
        const codeValidity = verification[0]?.otp.expiry;
        const presentDate = UtilityService.dateToUnix(new Date());
        console.log({codeValidity}, {presentDate});
        if(presentDate > codeValidity){
            console.log("Code has expired");
            throw new AuthenticationError(ResponseMessage.FAILED_PHONE_VERIFICATION_MESSAGE);
        }
        console.log({hashedToken}, {verificationToken})
        if(hashedToken !== verificationToken){
            throw new AuthenticationError("Invalid verification or expired OTP");
        }
        return;
    }

}
