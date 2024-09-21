import { injectable } from "inversify";
import { Repository } from "../../../Infrastructure/Repository/MongoDB/Repository";
import { FileManager } from "../../Entities/Models/FileManager";
import { Model } from "../../Enums/Model";


@injectable()
export default class FileManagerRepository {

    private repository: Repository<FileManager>;
    constructor() {
        this.repository = new Repository<FileManager>(Model.FileManager);
    }


    async create(fileData: Partial<FileManager>): Promise<FileManager | null | undefined> {
        try {
            const result = await this.repository.create(fileData);
            return result;
        } catch (err: any) {
            console.log("FileManagerRepository::create() -> ", err.message);
        } finally {
            await this.repository.closeConnection();
        }
    }
    
    async get(userId: any): Promise<any> {
        try {
            const filesData = await this.repository.getByPredicate({ userId: userId });
            return filesData;
        } catch (err: any) {
            console.log("FileManagerRepository::get() -> ", err.message);
            
        } finally {
            await this.repository.closeConnection();
        }
    }
    
    async getByPredicate(predicate: Partial<FileManager>): Promise<FileManager | null | undefined> {
        try {
            const result = await this.repository.getByPredicate(predicate) as FileManager[];
            return result[0];
        } catch (err: any) {
            console.log("FileManagerRepository::getByPredicate() -> ", err.message);
        } finally {
            await this.repository.closeConnection();
        }
    }
    
    async getFileByKeyPrefix(prefix: string) {
        try {
            const sanitizedPrefix = prefix.trim();
            const result = await this.repository.findByPrefix('fileKey', sanitizedPrefix);
            return result;
        } catch (err: any) {
            console.log("FileManagerRepository::getFileByPrefix() -> ", err.message);
        } finally {
            await this.repository.closeConnection();
        }
    }
    
}

