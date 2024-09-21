import UtilityService from "../../../Services/UtilityService";
import User from "../../Entities/Models/User";
import AuthServices from "../../Services/AuthServices";

export class PhoneVerificationResponse {
    phone: string;
    token: string;
    expiry: string;
    create(result: any) {
        this.phone = result.phone;
        this.token = result.reference;
        this.expiry = result.expiry;
    }
}

export class UserInfoDTO {
    public country: string;
    public state: string;
    public firstName: string;
    public middleName?: string; // Optional
    public user?: User; // for me and not for the endpoint
    public lastName: string;
    public licenseNumber: string;
    public dateOfBirth: Date;
    public licenseExpiryDate: Date;
}

export class UserDetailsResponse {
    public _id: string;
    public first_name: string;
    public last_name: string;
    public drivers_license: string;
    public email: string;
    public age: number; 
    public type: string;
    public status: string;
    public isActive: boolean;
    public verification_level: number;
    public verification_id: string;
    public verified_selfie: boolean;
    public verified_poa: boolean; 
    public verified_pid: boolean; 
    public roles: string[];
    public created_at: string;
    public updated_at: string;
    public token: string;
    constructor(
        
      ) {}

      create(response: User) {
          this._id = response._id?.toString() || "",
          this.first_name = response.first_name || "",
          this.last_name = response.last_name || "",
          this.email = response.email || "";
          this.drivers_license = response.drivers_license,
          this.age = response.age, 
          this.type = response.type || "",
          this.status = response.status || "",
          this.isActive = response.isActive || false,
          this.roles = response.roles;
          this.verification_level = response.verification_level;
          this.verification_id = response.verification_id?.toString() || "";
          this.verified_selfie = response.verified_selfie || false,
          this.verified_poa = response.verified_poa || false,
          this.verified_pid = response.verified_pid || false,
          this.created_at = response.created_at || new Date().toISOString(),
          this.updated_at = response.updated_at || new Date().toISOString(),
          this.token = AuthServices.createToken(this.tokenData({roles: response.roles}))
        }

        private tokenData(data: any){
          
          const currentDate = new Date(); //Present time
          //add 10mins to it for expiry, token expiration is in 10mins
          const expiryTime = new Date(currentDate.getTime() + 10 * 60 * 1000);
           return {
            _id: this._id,
            iat: UtilityService.dateToUnix(currentDate),
            exp: UtilityService.dateToUnix(expiryTime),
            roles: data?.roles
           }
        }
}
    