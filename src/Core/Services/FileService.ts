import { Readable } from "stream";
import mime from 'mime-types';
import UtilityService from "../../Services/UtilityService";
import {delimeter, allowedFileTypes, allowedImageFileTypes } from "../Constants";
import { ValidationError } from "../Application/Error/AppError";
import { injectable } from "inversify";
import { ResponseMessage } from "../Application/Response/ResponseFormat";
import { FileData, FileManager } from "../Entities/Models/FileManager";
import { BucketName } from "../Enums/BucketsKey";
import FileManagerRepository from "../Application/Repository/FileManagerRepository";

@injectable()
export default class FileService {
   constructor(private _fileManagerRepository: FileManagerRepository) { }
   async fileFormatter(Body: Readable, ContentType: string, fileKey: string) {
      try {
         console.log({fileKey})
         console.log("FileType: ", mime.lookup(fileKey as string));
         const mimeType = ContentType || mime.lookup(fileKey as string);
         console.log({mimeType});
         if (mimeType && mimeType.includes('text/html')) {
            //perform email stuff
            console.log("FileType is of type email: ", mimeType);
            return Body;
         }
         if (mimeType && mimeType.includes('image')) {
            // Perform image stuff
            return Body;
         } 
         else {
            throw new ValidationError(ResponseMessage.INVALID_FILE_TYPE)
         } 
      } catch (error: any) {
         throw error;
      }
   }

   
   // Other file formatter methods can be added here
   public static fileRename(uploadPurpose: UploadPurpose, fileType: string, userId: string, distinguisher: string = '') {
      // return tuple of filename and directory name
      FileService.uploadVerificationFileCheck(uploadPurpose, fileType)
      FileService.uploadCarImageFileCheck(uploadPurpose, fileType)
      FileService.uploadUserProfileFileCheck(uploadPurpose, fileType)
      const createdTime = UtilityService.formatDateToUrlSafeISOFormat(new Date())
      const directoryName: string = `${uploadPurpose}${delimeter.Directory}`
      const fileName: string = `${directoryName}${userId}${delimeter.S3_FileKey}${distinguisher}${delimeter.S3_FileKey}${createdTime}`;
      return [directoryName, fileName];
   }

   public async saveFileMetadataToDatabaseAsync(userId: string, fileType: string, uploadPurpose: UploadPurpose, fileKeyData: [string, string] = ['', '']): Promise<FileManager> {
      const data = fileKeyData[1] === '' ? FileService.fileRename(uploadPurpose, fileType, userId) : fileKeyData;
      console.log("Save to database: ",{data});
      const fileData: FileData = {
          key: data[1],
          userId: userId,
          uploadPurpose: UploadPurpose.Verification,
          bucketName: BucketName.VERIFICATION,
          contentType: fileType,
          createdTime: UtilityService.dateToUnix(new Date())
      }
    const file = new FileManager();
    file.create(fileData);
    const result = await this._fileManagerRepository.create(file);
    console.log({result})
    return result as FileManager;
  }


   //File validation
   public validateFileType(fileType: string): void {
      if (!fileType || !allowedFileTypes.includes(fileType)) {
         throw new ValidationError(ResponseMessage.INVALID_FILE_TYPE);
      }
      console.log('validate file type')
      return;
   }
   public validateImageType(fileType: string): void {
      console.log('validate file type')
      if (!fileType || !allowedImageFileTypes.includes(fileType)) {
         throw new ValidationError(ResponseMessage.INVALID_FILE_TYPE);
      }
      return;
   }

   public validateFileSize(fileSize: number, allowedFileSize: number = 5): void {
      const fileSizeInMegaBytes: number = UtilityService.convertBytesToMegaBytes(fileSize);
      console.log({allowedFileSize});
      if (fileSizeInMegaBytes > allowedFileSize) {
         throw new ValidationError(ResponseMessage.INVALID_FILE_SIZE);
      }
      console.log('validate file size')
      return;
   }


   private static uploadVerificationFileCheck(uploadPurpose: UploadPurpose, fileType: string): void {
      if (uploadPurpose === UploadPurpose.Verification && !allowedFileTypes.includes(fileType)) {
         console.log({ fileType })
         throw new Error(`${ResponseMessage.INVALID_FILE_TYPE} for ${uploadPurpose}`);
      }
      return;
   }
   private static uploadCarImageFileCheck(uploadPurpose: UploadPurpose, fileType: string): void {
      if (uploadPurpose === UploadPurpose.CarImage && !allowedFileTypes.includes(fileType)) {
         console.log({ fileType })
         throw new Error(`${ResponseMessage.INVALID_FILE_TYPE} for ${uploadPurpose}`);
      }
      return;
   }
   private static uploadUserProfileFileCheck(uploadPurpose: UploadPurpose, fileType: string): void {
      if (uploadPurpose === UploadPurpose.UserProfile && !allowedFileTypes.includes(fileType)) {
         console.log({ fileType })
         throw new Error(`${ResponseMessage.INVALID_FILE_TYPE} for ${uploadPurpose}`);
      }
      return;
   }
}

export enum UploadPurpose {
   Verification = 'verification',
   SelfieFacialRecognition = 'selfierecognition',
   LicenseFacialRecognition = 'licenserecognition',
   CarImage = 'carimage',
   UserProfile = 'userprofile'
}
