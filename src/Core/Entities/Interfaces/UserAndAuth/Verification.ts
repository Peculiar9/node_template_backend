import { ObjectId } from "mongodb";
import { OTP } from "../../Models/Verification";

export interface IVerification {
    _id: ObjectId | undefined ;
    reference?: string; //the guid from the link
    token?: string; //the token from the link
    otp?: any | OTP; //the one-time password (if applicable)
    status?: string;
    expiry?: number;
    created_at: string;
    updated_at: string;
}