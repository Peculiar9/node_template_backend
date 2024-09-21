import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";

export default class CryptoService{

    constructor() {

    }

    public static hashString(password: string, salt: string){
        return CryptoJS.HmacSHA256(password, salt).toString();
    }
    
    public static generateValidSalt(){
        return bcrypt.genSaltSync(16);
    }    
    
}