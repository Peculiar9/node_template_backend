import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import FileService from "../Core/Services/FileService";
import { SNSClient } from "@aws-sdk/client-sns";
import { Readable } from "stream";
import { SMSData } from "../Core/Services/SMSServices";
import { SMSType } from "../Core/Enums/SMSType";
import { EmailType } from "../Core/Enums/EmailType";
import { BucketName } from "../Core/Enums/BucketsKey";
import { APP_NAME } from "../Core/appConfig";
import { EmailData } from "../Core/Services/EmailService";
// import { RekognitionClient, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { injectable } from "inversify";
import UtilityService from "./UtilityService";
import { ValidationError } from "../Core/Application/Error/AppError";
import mime from "mime";
import { FileFormat } from "../Core/Constants";
import { ResponseMessage } from "../Core/Application/Response/ResponseFormat";

@injectable()
export default class AWSBaseService {
    protected fileService: FileService;
    protected s3Client: S3Client;
    protected s3KYCClient: S3Client;
    protected snsClient: SNSClient;
    protected rekognitionClient: RekognitionClient;

    constructor() {
        //S3 Client
        this.s3Client = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID_EMAIL!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_EMAIL!,
            },
            region: process.env.AWS_REGION
        });

        this.s3KYCClient = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID_KYC!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_KYC!,
            },
            region: process.env.AWS_REGION
        })
        this.snsClient = new SNSClient({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID_KYC!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_KYC!,
            },
            region: process.env.AWS_REGION
        });

        this.rekognitionClient = new RekognitionClient({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID_KYC!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_KYC!,
            },
            region: process.env.AWS_REGION
          });

    }



    protected replaceVariables(template: string, variables: { [key: string]: string }): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value);
        }
        return result;
    }

    //parse email template
    protected async parseEmailTemplate(stream: Readable): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let data = '';
            stream.on('data', (chunk) => {
                data += chunk;
            });
            stream.on('end', () => {
                // console.log('AWSHelper::parseEmailTemplate response => ', data);
                resolve(data);
            });
            stream.on('error', (error) => {
                console.log('AWSHelper::parseEmailTemplate error => ', error.message);
                reject(error);
            });
        });
    }

    //universal get file from S3 Bucket. 
    protected async getFile(bucketName: string, fileKey: string): Promise<{ Body: Readable | null | undefined, ContentType: string | undefined }> {
        try {
            const command = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });
            const response = await this.s3Client.send(command);
            return {
                Body: response.Body as Readable,
                ContentType: response.ContentType
            };
        } catch (error: any) {
            console.log('AWSHelper::getFile() => error => ', error.message);
            throw error;
        }
    }

    protected async getEmailTemplate(emailType: string, data: EmailData) {
        if (emailType === EmailType.VERIFICATION) {
            const bucketName = BucketName.EMAIL_TEMPLATE_S3_BUCKET;
            console.log({ bucketName });
            const key = `${emailType}-email.html`;
            const verificationEmailTemplate = await this.getEmailFile(bucketName, key, data)
            return verificationEmailTemplate;
        }

        if (emailType === EmailType.WAITLIST) {
            const bucketName = BucketName.EMAIL_TEMPLATE_S3_BUCKET;
            console.log({ bucketName });
            const key = `${emailType}-welcome.html`;
            console.log({ key });
            const welcomeEmailTemplate = await this.getEmailFile(bucketName, key, data);
            return welcomeEmailTemplate;
        }

        if (emailType === EmailType.SUBSCRIPTION) {
            const bucketName = BucketName.EMAIL_TEMPLATE_S3_BUCKET;
            console.log({ bucketName });
            const key = `${emailType}-email.html`;
            console.log({ key });
            const subscriptionEmailTemplate = await this.getEmailFile(bucketName, key, data);
            return subscriptionEmailTemplate;
        }

        if (emailType === EmailType.FORGOT_PASSWORD) {
            const bucketName = BucketName.EMAIL_TEMPLATE_S3_BUCKET;
            console.log({ bucketName });
            const key = `${emailType}-email.html`;
            console.log({ key });
            const forgotPasswordEmailTemplate = await this.getEmailFile(bucketName, key, data);
            return forgotPasswordEmailTemplate;
        }
    }

    protected getEmailHeaderData(emailType: string) {
        if (emailType === EmailType.VERIFICATION) {
            return EmailHeaderData.VERIFICATION;
        }
        if (emailType === EmailType.WELCOME) {
            return EmailHeaderData.WELCOME;
        }
        if (emailType === EmailType.WAITLIST) {
            return EmailHeaderData.WAITLIST;
        }
        if (emailType === EmailType.SUBSCRIPTION) {
            return EmailHeaderData.WELCOME;
        }
        if (emailType === EmailType.FORGOT_PASSWORD) {

        }
        //TODO: For Order confirmation and password reset e.t.c
    }


    protected async getEmailFile(bucketName: string, key: string, data: EmailData) {
        const { Body, ContentType } = await this.getFile(bucketName as string, key as string);
        // console.log("FileBody: ", { Body });
        console.log("ContentType: ", { ContentType });
        // const emailFile = await this.fileService?.fileFormatter(Body as Readable, ContentType as string, key as string);
        const mimeType =  ContentType || mime.lookup(key as string);
        if(mimeType !== FileFormat.HTML){
            throw new ValidationError(ResponseMessage.INVALID_FILE_TYPE);
        }
        const emailFile = Body as Readable;
        if (!emailFile) throw new Error("email template does not exist!!!");
        const emailContent = await this.parseEmailTemplate(emailFile as Readable);

        const variables = { APP_NAME: 'NodeBackend', recipient: data?.recipient as string, userName: data?.firstName as string, verificationLink: data?.verificationUrl as string, CompanyName: "NodeBackend" };
        const emailTemplate = this.replaceVariables(emailContent, variables);
        console.log({ emailTemplate });
        return emailTemplate;
    }
    protected async uploadFile({
        bucketName,
        directoryPath,
        fileName,
        fileBody,
        contentType,
    }: FileUploadOptions): Promise<void> {
        try {
            const fileKey = fileName;
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: fileKey,
                Body: fileBody,
                ContentType: contentType,
            });

            const response = await this.s3KYCClient.send(command);
            const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
            console.log("File uploaded successfully:", response, fileUrl);
        } catch (error: any) {
            console.log("AWSHelper::uploadFile() => error => ", error.message);
            throw error;
        }
    };

    protected async removeFile({
        bucketName,
        fileName,
      }: FileRemovalOptions): Promise<void> {
        try {
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: fileName,
          });
    
          const response = await this.s3KYCClient.send(command);
          console.log("File removed successfully:", response);
        } catch (error: any) {
          console.error("AWSHelper::removeFile() => error => ", error.message);
          throw error;
        }
      }

    protected getSMSParams(data: SMSData, smsType: string) {
        if (smsType === SMSType.BULK) {
            const params = {
                Message: data?.message,
                Subject: data?.attributes?.subject,
                TopicArn: data?.attributes?.topicArn
            }
            return params;
        }
        else {
            const params = {
                Message: data?.message,
                PhoneNumber: data?.recipient,
                MessageAttributes: {
                    'SNS.SMS.SMdata?.SType': {
                        DataType: data?.attributes?.datatype ?? 'string',
                        StringValue: data?.attributes?.value ?? 'Transactional',
                    }
                }
            };
            return params;
        }
    }


    //HELPER METHODS
    protected emailValidation(recipient: string) {
        const isValidEmail = UtilityService.isValidEmail(recipient.trim())
        if (!isValidEmail) {
            throw new ValidationError('Invalid email, please check and try again!!!');
        }
    }


}
export interface FileUploadOptions {
    bucketName: string;
    directoryPath: string;
    fileName: string;
    fileBody: Readable | Buffer | string;
    contentType?: string;
}

export interface FileRemovalOptions {
    bucketName: string;
    fileName: string;
}

export interface BaseAWSSDKResponse {
        httpStatusCode: number;
        requestId: string;
        extendedRequestId?: string;
        cfId?: string;
        attempts: number;
        totalRetryDelay: number;  
}

export interface DetectTextResponse {
    $metadata: BaseAWSSDKResponse;
    TextDetections: unknown[]; // Replace with the actual type of TextDetections which is string but let us test for now.
    TextModelVersion: string;
}

export interface S3UploadResponse {
    $metadata: BaseAWSSDKResponse;
     MessageId: string;
}




export enum EmailHeaderData {
    WELCOME = `Welcome to ${APP_NAME}`,
    WAITLIST = `Welcome to ${APP_NAME}`,
    OTP = ` Verify It's You: OTP `,
    VERIFICATION = ` Verify It's You `,
    PASSWORD_RESET = `Unlock Your Account: Reset Password Inside`,
    ORDER_CONFIRMATION = `Your Order, Confirmed: Details Enclosed`
}