// import { inject } from "inversify";
// import User from "../../Entities/Models/User";
// import { IUserRepository } from "../../Interfaces/Repository/IUserRepository";
import { injectable } from "inversify";
import { IAccountUseCase } from "../../Interfaces/UseCases/IAccountUseCase";
import UserRepository from "../Repository/UserRepository";
import {
  AdminCreateUserDTO,
  PreSignUpResponseDTO,
  PreSignUpUserDTO,
} from "../../DTOs/UserDTOs/CreateUserDTO";
import User from "../../Entities/Models/User";
import EmailService, { EmailData } from "../../Services/EmailService";
import { ResponseMessage } from "../Response/ResponseFormat";
import PasswordService from './../../Services/Helper/PasswordService';
import { UserLoginResponseDTO } from "../../DTOs/UserDTOs/AuthDTO";
import { AccessibilityError, AuthenticationError, ValidationError } from "../Error/AppError";
import VerificationRepository from "../Repository/VerificationRepository";
import Verification from "../../Entities/Models/Verification";
import { USER } from "../../Enums/UserType";
import { USER_ROLES } from "../../Enums/UserRoles";

@injectable()
export default class AccountUseCase implements IAccountUseCase {
  private _emailService: EmailService;
  constructor(private readonly _userRepository: UserRepository, private readonly _verificationRepository: VerificationRepository) { 
    this._emailService = new EmailService();
  }
  getUserList: () => any;
  resendEmail: (data: EmailData) => Promise<boolean>;

  public async preSignUpRenter(userCreateRequestBody: PreSignUpUserDTO, next: string): Promise<any> {
    userCreateRequestBody.usertype = 1; //meaning user is of type renter
    const [response, user] = await this.preSignUpHandler(userCreateRequestBody, USER.RENTER);
   await this.verificationEmailSenderHandler(user, next);
    return response;
  }

  public async preSignUpHost(userCreateRequestBody: PreSignUpUserDTO, next: string): Promise<any> {
    userCreateRequestBody.usertype = 2; //meaning user is of type host
    const [response, user] = await this.preSignUpHandler(userCreateRequestBody, USER.HOST);
    await this.verificationEmailSenderHandler(user, next);
    return response;
  }

  private async preSignUpHandler(userCreateRequestBody: PreSignUpUserDTO, userType: USER){
    const response: User = await this.presignUpUserCreate(userCreateRequestBody, userType);
    const responseData = new PreSignUpResponseDTO();
    responseData.create(response);

    return [responseData, response as User];
  }

  //Creating User
  private async presignUpUserCreate(data: any, userType: USER): Promise<User> {
    //TODO: dirty code clean it later. This validation is just after my life. 
    if (!data || Object.keys(data).length === 0 && data.constructor === Object) {
      throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE);
    }
    const userObj = new User();
    userObj.create(data);
    const existingUser = await this._userRepository.getUserByPredicate({ email: userObj.email.toLowerCase() });
    if (existingUser) {
      if (existingUser.type === USER.HOST && userType === USER.RENTER) {
        throw new AccessibilityError(ResponseMessage.USER_ALREADY_HOST_REDIRECT_TO_RENTER);
      }

      if (existingUser.type === USER.RENTER && userType === USER.HOST) {
        throw new AccessibilityError(ResponseMessage.USER_ALREADY_RENTER_REDIRECT_TO_HOST);
      }

      throw new AccessibilityError(ResponseMessage.DUPLICATE_EMAIL_MESSAGE);
    }
    const response = await this._userRepository.create(userObj);
    return response;
  }

  public async grantHostPriviledges(email: string, password: string){
     await this.handleEmailLogin(email, password);
     return await this.priviledgesHandler(email, USER_ROLES.HOST);
    }  
    public async grantRenterPriviledges(email: string, password: string){
      await this.handleEmailLogin(email, password);
      return await this.priviledgesHandler(email, USER_ROLES.RENTER);
   }  

  protected async priviledgesHandler(email: string, userRole: USER_ROLES){
    let userObject: Partial<User> = {};  
         userObject = await this._userRepository.getUserByPredicate({email: email.trim()}) as User;
         if(!userObject){
          throw new ValidationError(ResponseMessage.USER_DOESNT_EXISTS);
         }
         if(!await this._userRepository.addRole(userObject?._id as string, userRole)){
            throw new ValidationError(ResponseMessage.USER_ROLE_UPDATE_NOT_SUCCESSFUL);
         }
         //TODO: Rig to add role to object without duplicate, could be a glitch
         userObject.roles?.push(userRole); 
         return userObject as User;
  } 

  public async verificationEmailSenderHandler(user: any, next: string): Promise<any>{
    await this._emailService.sendVerificationEmail({ recipient: user.email, firstName: user.first_name }, user.salt, next as string);
  }


  //Creating Admin
  public async adminUserCreate(data: AdminCreateUserDTO): Promise<PreSignUpResponseDTO> {
    if (!data) {
      throw new ValidationError("User information required!!!");
    }
    const userObj = new User();
    const responseData = new PreSignUpResponseDTO();
    userObj.createAdmin(data);
    const response = await this._userRepository.create(userObj);
    responseData.create(response);
    return responseData;
  }

  public async login(data: any): Promise<any> {
    if (!data) throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE);
    const { countryCode, phone, email, password } = data;
    let responseData = new UserLoginResponseDTO;
    if (!email) {
      if (!countryCode && !phone) throw new AuthenticationError(ResponseMessage.PHONE_EMAIL_REQUIRED);
      const user = await this.handlePhoneLogin(countryCode, phone, password);
      responseData.create(user)
      return responseData;
    }
    const user = await this.handleEmailLogin(data?.email, data?.password);
    responseData.create(user)
    return responseData;
  };

  private async handleEmailLogin(email: string, password: string): Promise<User> {
    const data = { email: email }
    const user = await this._userRepository.getUserByPredicate({ email: data.email }) as User;
    console.log({ data });
    if (!user) {
      throw new AuthenticationError(ResponseMessage.USER_DOESNT_EXISTS)
    }
    if (!await this.verifyPassword(data, password)) {
      throw new AuthenticationError(ResponseMessage.INVALID_EMAIL);
    }
    console.log({ user })
    return user;
  }

  private async handlePhoneLogin(countryCode: string, phone: string, password: string): Promise<User> {
    const data = { country_code: countryCode, phone: phone }
    const user = await this._userRepository.getUserByPredicate(data) as User;
    if (!user) {
      throw new AuthenticationError(ResponseMessage.INVALID_REQUEST_MESSAGE + ' invalid phone or password');
    }
    if (!await this.verifyPassword(data, password)) {
      throw new AuthenticationError(ResponseMessage.INVALID_REQUEST_MESSAGE + ' invalid phone or password');
    }
    return user;
  }

  private async verifyPassword(data: any, password: string): Promise<any> {
    const user = await this._userRepository.getUserByPredicate(data) as User;
    console.log({ user });
    const userData = user;
    console.log({ userData })
    const hashedPassword = PasswordService.hashPassword(password, userData?.salt).toString();
    const savedPassword = userData?.password;
    console.log({ hashedPassword })
    console.log({ savedPassword });
    if (hashedPassword !== userData?.password) {
      console.log("Invalid Password", { hashedPassword }, userData?.password);
      return false;
    }
    return true;
    //  const hashedPassword = await this.userRepository.
  }


  public async refreshToken(user: Partial<User>): Promise<PreSignUpResponseDTO> {
    const responseObj = new PreSignUpResponseDTO();
    responseObj.create(user as User);
    const response = responseObj;
    return response;
  }

  public async getUserDetails(verificationToken: string) {
    if (!verificationToken) {
      throw new ValidationError(ResponseMessage.TOKEN_MISSING);
    }
    const verification = await this._verificationRepository.getVerificationByGuidIdentifier(verificationToken) as Verification[];
    const userDetails = await this._userRepository.getUserByPredicate({ verification_id: verification[0]._id }) as User;
    return userDetails;
    // await this._userRepository.getUserById("");
  }

  public async removeUser(email: string) {
    if (!email) {
      throw new ValidationError(ResponseMessage.REQUIRED_FIELD_MESSAGE);
    }
    const result = await this._userRepository.removeUser(email);
    console.log("Delete Result: ", { result });
    if (!result) {
      throw new ValidationError('User does not exist or cannot be deleted!!!');
    }
    else return;
  }

  //==================//
  // Helper Functions //
  //==================//


}

