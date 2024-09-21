import { ObjectId } from "mongodb";
import { IVerification } from "../Interfaces/UserAndAuth/Verification";
import { VerificationStatus } from "../../Enums/VerificationStatus";
import UtilityService from "../../../Services/UtilityService";

export default class Verification implements IVerification {
    _id: ObjectId | undefined;
    reference?: string | undefined;
    token?: string;
    status?: string | undefined;
    expiry?: number;
    otp?: any | OTP;
    created_at: string;
    updated_at: string;

    create(data: any) {
        const date = new Date();
        this.reference = data.guid;
        this.token = data.token;
        this.otp = {};
        this.status = VerificationStatus.INITIATED,
        this.expiry = UtilityService.dateToUnix(new Date(date.getTime() + 12 * 24 * 60 * 60 * 1000)) // 12 days after initialization
        this.created_at = UtilityService.formatDateToISOFormat(date);
        this.updated_at = UtilityService.formatDateToISOFormat(date);
    }

}

export interface OTP {
    code: string;
    expiry: string;
}