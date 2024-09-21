import UtilityService from "../../../Services/UtilityService";
import User from "../../Entities/Models/User";
import AuthServices from "../../Services/AuthServices";

export class CreateUserDTO {
    constructor(
      public fullName: string,
      public email: string,
      public password: string,
      public tocAgreed: boolean,
      public emailSubscriber: boolean
    ) {}
  }
  
  export class PreSignUpUserDTO {
    constructor(
      public fullName: string,
      public email: string,
      public password: string,
      public tocAgreed: boolean,
      // public emailSubscriber: boolean,
      public usertype: number
    ) {}
  }

  export class AdminCreateUserDTO {
    constructor(
      public fullName: string,
      public email: string,
      public password: string,
      public tocAgreed: boolean,
    ) {}
  }



export class PreSignUpResponseDTO {
    public _id: string;
    public first_name: string;
    public last_name: string;
    public email: string;
    public age: number; 
    public type: string;
    public status: string;
    public isActive: boolean;
    public verification_id: string;
    public verified_selfie: boolean;
    public verified_poa: boolean; 
    public verified_pid: boolean; 
    public verification_level: number;
    public verification_progress: string;
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
          this.age = response.age, 
          this.type = response.type || "",
          this.status = response.status || "",
          this.isActive = response.isActive || false,
          this.roles = response.roles;
          this.verification_id = response.verification_id?.toString() || "";
          this.verified_selfie = response.verified_selfie || false,
          this.verified_poa = response.verified_poa || false,
          this.verified_pid = response.verified_pid || false,
          this.verification_level = response.verification_level,
          this.verification_progress = response.verification_progress,
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



