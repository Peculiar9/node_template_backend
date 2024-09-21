import { ObjectId } from "mongodb";
import { IFileManager } from "../Interfaces/IFileManager";

export class FileManager implements IFileManager {
    _id: string | ObjectId;
    fileKey: string;
    uploadPurpose?: string;
    userId?: string;
    bucketName: string;
    contentType?: string;
    createdTime?: number;

    constructor(){}

    create(fileData: FileData): void {
        this.fileKey = fileData.key;
        this.userId = fileData.userId;
        this.bucketName = fileData.bucketName;
        this.uploadPurpose = fileData.uploadPurpose;
        this.contentType = fileData.contentType;
        this.createdTime = fileData.createdTime;
    }

}

export interface FileData {
    key: string;
    userId: string;
    bucketName: string;
    uploadPurpose: string;
    contentType: string;
    createdTime: number;
}
