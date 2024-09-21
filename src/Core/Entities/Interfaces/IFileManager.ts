import { ObjectId } from "mongodb";

export interface IFileManager {
    _id: string | ObjectId;
    fileKey: string;
    uploadPurpose?: string;
    bucketName: string;
    contentType?: string;
}