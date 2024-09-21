import UtilityService from "../../Services/UtilityService";
import { APP_NAME } from "../appConfig";
import { ConfigurationError } from "../Application/Error/AppError";
import UserRepository from "../Application/Repository/UserRepository";

export default class AuthServices{
    private readonly _userRepository: UserRepository
    constructor(){
        this._userRepository = new UserRepository();
    }

    public static createToken(data: any){
        const secret = process.env.SECRET_KEY?.toString();
        if(!secret){
            throw new ConfigurationError("Secret is missing");
        }
        const payload = this.getClaims(data);
        const header = {
          alg: 'HS256',
          typ: 'JWT',
        };
        const header64 = UtilityService.base64UrlEncode(JSON.stringify(header));
        const payload64 = UtilityService.base64UrlEncode(JSON.stringify(payload));
        const concatenatedString = `${header64}.${payload64}`;
        const hash = UtilityService.createtokenHash(concatenatedString, secret);
        const encodedSignature = UtilityService.base64Tobase64UrlEncode(hash);
        const token = `${concatenatedString}.${encodedSignature}`;
        console.log('AuthServices::createToken => token: ', token);
        return token;
    }

    public async getUserFromToken(userId: string) {
        // Fetch user from the database using the user ID
        const user = await this._userRepository.getUserById(userId);
        return user;
    }

    private static getClaims = (data: any) => { 
        console.log({data});
        return {
            data: {
                "sub": data?._id,
                "exp": data?.exp,
                "iat": data?.iat,
                "iss": `https://${APP_NAME}.com`, 
                "aud": `${APP_NAME} users`, 
                "jti": UtilityService.Guid() ?? "", 
                "roles": data?.roles
            },
        }
    }

    
}
