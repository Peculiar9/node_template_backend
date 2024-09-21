import { Container } from "inversify";
import AccountUseCase from "./Application/UseCases/AccountUseCase";
import UserRepository from "./Application/Repository/UserRepository";
import { IAccountUseCase } from "./Interfaces/UseCases/IAccountUseCase";
import 'reflect-metadata';
import VerificationRepository from "./Application/Repository/VerificationRepository";
import { IKYCUseCase } from "./Interfaces/UseCases/IKYCUseCase";
import KYCUseCase from "./Application/UseCases/KYCUseCase";
import AWSHelper from "../Services/AWSHelper";
import AWSBaseService from "../Services/AWSBaseService";
import OTPService from "./Services/OTPService";
import BaseHTTPClient from "../Infrastructure/APIs/BaseHTTPClient";
import FileService from "./Services/FileService";
// import { Repository } from "../Infrastructure/Repository/MongoDB/Repository";

export default class DIContainer {
    constructor(private diContainerBuilder: Container) {
       
    }

    resolveDependencies(){
        // this.diContainerBuilder.bind<IUserRepository<User>>(REPO_TYPES.Repository).to(UserRepository);
        this.diContainerBuilder.bind<IAccountUseCase>('IAccountUseCase').to(AccountUseCase);
        this.diContainerBuilder.bind<IKYCUseCase>('IKYCUseCase').to(KYCUseCase);
        // this.diContainerBuilder.bind<IA>('IAccountUseCase').to(AccountUseCase);
        // this.diContainerBuilder.bind<Repository<any>>(REPO_TYPES.Repository).toSelf();
        
        
        this.diContainerBuilder.bind(UserRepository).toSelf();
        this.diContainerBuilder.bind(VerificationRepository).toSelf();
        this.diContainerBuilder.bind(AWSHelper).toSelf();   
        this.diContainerBuilder.bind(AWSBaseService).toSelf();   
        this.diContainerBuilder.bind(OTPService).toSelf();
        this.diContainerBuilder.bind(FileService).toSelf();          
        this.diContainerBuilder.bind(BaseHTTPClient).toSelf().inSingletonScope();   

    }
}