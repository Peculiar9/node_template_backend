import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import { v4 } from 'uuid';
export default class PasswordService{

    constructor() {

    }

    public static hashPassword(password: string, salt: string){
        return CryptoJS.HmacSHA256(password, salt)
    }
    
    public static generatePasswordSalt(){
        return bcrypt.genSaltSync(16);
    }


    public static generateHashedUserSecret(){
        const hashedSecret = CryptoJS.SHA256(v4()).toString();
        return hashedSecret;
    }


    
    
}