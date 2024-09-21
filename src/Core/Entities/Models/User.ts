import { ObjectId } from "mongodb";
import { IBillingInfo, ICardToken, IUser } from "../Interfaces/UserAndAuth/User";
import { ResponseMessage } from "../../Application/Response/ResponseFormat";
import { USER_ROLES } from "../../Enums/UserRoles";
import UtilityService from "../../../Services/UtilityService";
import { AdminCreateUserDTO, PreSignUpUserDTO } from "../../DTOs/UserDTOs/CreateUserDTO";
import { Version } from "../../Enums/Version";
import { USER } from "../../Enums/UserType";
import PasswordService from "../../Services/Helper/PasswordService";
import { UserInfoDTO } from "../../DTOs/KYCDTOs/VerificationDTO";
import CryptoService from "../../Services/Helper/CryptoService";
import { VerificationLevel, VerificationStatus } from "../../Enums/VerificationStatus";

export default class User implements IUser {
    
    _id?: ObjectId | string | undefined;
    first_name: string;
    last_name: string;
    drivers_license: string
    age: number;
    type: string;
    email: string;
    country_code: string;
    international_phone: string;
    phone: string;
    password: string;
    profile_image: string; //url for user image
    status: string;
    isActive: boolean;
    user_secret: string;
    salt: string;
    trips_count: number;
    host_trip_count: number;
    host_badges: string;
    user_criteria: string;
    card_tokens: ICardToken[];
    stripe_id: string;
    billing_info: IBillingInfo;
    hosted_cars: (ObjectId | string)[]; //references to the cars the user has listed (host role)
    favourite_cars: (ObjectId | string)[]; // ids of cars that the user considers their favourites
    favourite_hosts: (ObjectId | string)[];  // ids of hosts that the user considers their favourites
    verification_id: ObjectId | undefined; //reference to the verification table
    verification_progress: string;
    verification_level: number | VerificationLevel; // VerificationLevel enumerator
    required_pid: boolean;
    required_poa: boolean;
    required_selfie: boolean;
    verified_selfie: boolean;
    verified_poa: boolean;
    verified_pid: boolean;
    roles: string[]; //Roles: "renter", "host" or both
    created_at: string;
    updated_at: string;
    __v: number;
    
    // constructor(){
    // }

    public create(data: PreSignUpUserDTO): void {
        const nullityCheckField = UtilityService.objectNullCheck(data);

        console.log({ nullityCheckField });
        if (nullityCheckField) {
            throw new Error(ResponseMessage.REQUIRED_FIELD_MESSAGE + `[${nullityCheckField}]`);
        }
        const fullNameArr = data.fullName.split(" ");
        const firstName = fullNameArr[0];
        const lastName = fullNameArr[1];



        const date = new Date();
        const dateTimeValue = UtilityService.formatDateToISOFormat(date);
        const validSalt =   PasswordService.generatePasswordSalt();
        const secret = PasswordService.generateHashedUserSecret()
        this.first_name = firstName;
        this.last_name = lastName;
        this.validateEmail(data.email.trim().toLowerCase());
        this.email = data.email.toLowerCase();
        this.phone = "";
        this.international_phone = "";
        this.country_code = "";
        this.salt = validSalt;
        this.user_secret = secret;
        const hashedPassword = PasswordService.hashPassword(data.password, validSalt).toString();

        this.password = hashedPassword;



        this.trips_count = 0;
        this.favourite_cars = [];
        this.favourite_hosts = [];
        this.hosted_cars = [];
        this.verification_progress = "";

        this.isActive = false;
        this.status = "pending";
        this.validateUserType(data.usertype);
        this.required_pid = false;
        this.required_poa = false;
        this.required_selfie = false;
        this.verified_selfie = false;
        this.verified_poa = false;
        this.verified_pid = false;
        this.created_at = dateTimeValue;
        this.updated_at = dateTimeValue;

        this.__v = Version.INIT;
    }

    //TODO: Location

    createAdmin(data: AdminCreateUserDTO) {
        this.roles = [USER_ROLES.ADMIN, USER_ROLES.BASIC_USER, USER_ROLES.PREMIUM_USER, USER_ROLES.TIER_THREE];
        this.validateRole(this.roles);

        const nullityCheckField = UtilityService.objectNullCheck(data);

        console.log({ nullityCheckField });

        if (nullityCheckField) {
            throw new Error(ResponseMessage.REQUIRED_FIELD_MESSAGE + `[${nullityCheckField}]`);
        }

        const fullNameArr = data.fullName.split(" ");
        const firstName = fullNameArr[0];
        const lastName = fullNameArr[1];
        this.first_name = firstName;
        this.last_name = lastName;
        this.type = USER.SUPERADMIN;


        const date = new Date();
        const dateTimeValue = UtilityService.formatDateToISOFormat(date);
        const validSalt = PasswordService.generatePasswordSalt();
        const secret = PasswordService.generateHashedUserSecret()
        this.first_name = firstName;
        this.last_name = lastName;
        this.validateEmail(data.email.trim().toLowerCase());
        this.email = data.email.toLowerCase();
        this.phone = "";
        this.international_phone = "";
        this.country_code = "";
        this.roles = [USER_ROLES.BASIC_USER];
        this.salt = validSalt;
        this.user_secret = secret;
        const hashedPassword = PasswordService.hashPassword(data.password, validSalt).toString();

        this.password = hashedPassword;



        this.trips_count = 0;
        this.verification_progress = "";

        this.isActive = false;
        this.status = "pending";
        this.required_pid = false;
        this.required_poa = false;
        this.required_selfie = false;
        this.verified_selfie = true;
        this.verified_poa = true;
        this.verified_pid = true;
        this.created_at = dateTimeValue;
        this.updated_at = dateTimeValue;


        this.__v = Version.INIT;

    }

    public update(data: any) {
        // this.validateRequiredFields({firstName, lastName, email});
        // this.validateUserType(this.type);
        // this.validateAge(this.age);
        // this.validateUserType(this.type);
        // this.validateRole(this.role);

    }
    public updateUserDetails(data: UserInfoDTO, userSalt: string) {
        const hashedDriversLicense = CryptoService.hashString(data?.licenseNumber as string, userSalt).toString();
        this.first_name = data?.firstName;
        this.last_name = data?.lastName;
        this.drivers_license = hashedDriversLicense;
        this.verification_progress = VerificationStatus.IN_REVIEW;
        this.verification_level = VerificationLevel.license;
    }

    private validateUserType(userType: number) {
        if (userType === 0) {
            this.type = USER.SUPERADMIN;
            return;
        }
        if (userType === 1) {
            this.type = USER.RENTER
            this.roles = [USER_ROLES.BASIC_USER, USER_ROLES.RENTER];
            return;
        }
        if (userType === 2) {
            this.type = USER.HOST
            this.roles = [USER_ROLES.BASIC_USER, USER_ROLES.HOST];
            return;
        }
        else {
            throw new Error("Invalid UserType");
        }
    }

    private validateEmail(email: string) {
        if (!UtilityService.isValidEmail(email)) {
            throw new Error("Invalid Email")
        }
        else return;
    }

    // private validateRequiredFields({firstName, lastName, email}){
    //     if(!firstName && !lastName && email){

    //         throw new Error(ResponseMessage.REQUIRED_FIELD_MESSAGE);
    //     }
    // }

    private validateRole(role: string[]) {
        if (role.length < 1) {
            throw new Error(ResponseMessage.REQUIRED_FIELD_MESSAGE);
        }
    }

    // private validateUserType(type: string){
    //     if(!type){
    //         throw new Error(ResponseMessage.REQUIRED_FIELD_MESSAGE);
    //     }
    //     if(type === USER.SUPERADMIN){
    //         this.role.push(USER_ROLES.ADMIN, USER_ROLES.PREMIUM_USER, USER_ROLES.TIER_THREE);
    //         this.age = 100;
    //     }
    // }

    // private validateAge(age: number){
    //     if(age < 18){
    //         throw new Error("Minimum age requirement not met!!!");
    //     }
    // }
}