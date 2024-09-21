import { injectable } from "inversify";
import Verification from "../../Entities/Models/Verification";
import { IVerificationRepository } from "../../Interfaces/Repository/IVerificationRepository";
import { Repository } from "../../../Infrastructure/Repository/MongoDB/Repository";
import { Model } from "../../Enums/Model";
@injectable()
export default class VerificationRepository implements IVerificationRepository<Verification>{

    private readonly _repository: Repository<Verification>;
    constructor(){
        this._repository = new Repository<Verification>(Model.Verification);
    }
    async getVerificationByGuidIdentifier(id: string): Promise<Verification[] | null | undefined> {
        try {
            const predicate = { reference: id };
            const result = await this._repository.getByPredicate(predicate);
            return result;
        } catch (err: any) {
            console.log("VerificationRepository::getVerificationByGuidIdentifier() -> ", err.message);
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async getVerificationById(id: string): Promise<Verification | null | undefined> {
        try {
            const result = await this._repository.getById(id);
            return result;
        } catch (err: any) {
            console.log("VerificationRepository::getVerificationById() -> ", err.message);
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async createVerification(data: Partial<Verification>): Promise<Verification|undefined> {
        try {
            const result = await this._repository.create(data);
            return result;
        } catch (err: any) {
            console.log("VerificationRepository::createVerification() -> ", err.message);
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async updateVerificationById(id: string, data: Partial<Verification>): Promise<any> {
        try {
            // Assuming this method would be implemented later
            throw new Error("Method not implemented.");
        } catch (err: any) {
            console.log("VerificationRepository::updateVerificationById() -> ", err.message);
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async updateVerificationByPredicate(predicate: Partial<Verification>, data: Partial<Verification>) {
        try {
            const [result, updateSuccessful] = await this._repository.updateByPredicate(predicate, data);
            console.log([result, updateSuccessful]);
            if (!updateSuccessful) {
                console.log("Could not update verification");
            }
            return result;
        } catch (err: any) {
            console.log("VerificationRepository::updateVerificationByPredicate() -> ", err.message);
        } finally {
            await this._repository.closeConnection();
        }
    }
    
    async updateAsync(filter: Partial<Verification>, data: Partial<Verification>): Promise<Verification|undefined> {
        try {
            const result = await this._repository.updateAsync(filter, data);
            return result as Verification;
        } catch (err: any) {
            console.log("VerificationRepository::updateAsync() -> ", err.message);
        } finally {
            await this._repository.closeConnection();
        }
    }

}

