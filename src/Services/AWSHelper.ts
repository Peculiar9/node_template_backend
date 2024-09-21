import { config, SES, SNS } from 'aws-sdk';
import { APP_NAME } from '../Core/appConfig';
import { SMSData } from '../Core/Services/SMSServices';
import AWSBaseService from './AWSBaseService';
import { PublishCommand } from '@aws-sdk/client-sns';
import { BucketName } from '../Core/Enums/BucketsKey';
import { ComparedFace, CompareFacesCommand, CompareFacesMatch, DetectLabelsCommand, DetectLabelsCommandOutput, DetectTextCommand, DetectTextCommandOutput } from '@aws-sdk/client-rekognition';
import { ValidationError } from '../Core/Application/Error/AppError';
import { ResponseMessage } from '../Core/Application/Response/ResponseFormat';
import { FileFormat } from '../Core/Constants';
// import { BucketName } from '../Core/Enums/BucketsKey';

export default class AWSHelper extends AWSBaseService {
    public ses: SES;
    public sns: SNS;
    // public s3: S3;
    public s3Bucket: any; // bucket name
    // private key: any; //  secret access key for the AWS resource

    constructor(key: string, secret: string) {
        super();
        this.ses = new SES(); //This will change as there are multiple usecases of AWS SDK implementations
        // this.sns = new SNS(); //So for each instance of the configuration we are going to have to create a access key and secret
        //but for now, we just assume that we have generic access key and secret that has all the access policies attached to the IAM ROLE.
        const sharedConfig = {
            accessKeyId: key,
            secretAccessKey: secret,
            region: process.env.AWS_REGION
        };
        config.update(sharedConfig);
        config.logger = console;
        this.s3Bucket = process.env.EMAIL_TEMPLATE_S3_BUCKET;
    }


    public async sendEmail(data: any, emailType: string) {
        try {
            const recipient = data?.recipient;
            this.emailValidation(recipient);
            const emailTemplate = await this.getEmailTemplate(emailType, data);
            const headerData: any = this.getEmailHeaderData(emailType);
            const params = {
                Destination: {
                    ToAddresses: [recipient],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: emailTemplate as string,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: headerData?.toString(),
                    },
                },
                Source: `no-reply@${APP_NAME}.com`,
            };

            await this.ses.sendEmail(params).promise();
        } catch (error: any) {
            console.log('AWSHelper::sendEmail() => error => ', error.message);
        };
    }

    // public async sendSMS(data: SMSData, smsType: string): Promise<any>{
    //     try {
    //         const params = this.getSMSParams(data, smsType);
    //         return await this.sns.publish(params).promise();
    //     } catch(error: any){
    //         console.log('AWSHelper::sendSMS() => error => ', error.message);
    //     }
    // }
    public async sendSMS(data: SMSData, smsType: string): Promise<any> {
        try {
            const params = {
                PhoneNumber: data.recipient,
                Message: data.message,
            };

            const command = new PublishCommand(params);
            const response = await this.snsClient.send(command);
            return response;
        } catch (error: any) {
            console.log('AWSHelper::sendSMS() => error => ', error.message);
        }
    }

    public async licenseDetailsUpload(file: any, fileKey: string): Promise<any> {
        console.log({fileKey});
        const uploadData = {
            bucketName: BucketName.VERIFICATION,
            directoryPath: `license/`,
            fileName: fileKey,
            fileBody: file,
            // contentType: file.mimetype,
        }
        await this.uploadFile(uploadData);
    }

    public async carImageUpload(file: any, fileKey: string): Promise<any> {
        console.log({fileKey});
        const uploadData = {
            bucketName: BucketName.VERIFICATION,
            directoryPath: `carImage/`,
            fileName: fileKey,
            fileBody: file.buffer,
            contentType: file.type,
        }
        const imageUploadResponse = await this.uploadFile(uploadData);
        console.log({imageUploadResponse});
    }

    public async detectImageObject(file: Buffer, validLabels: string[]) {
        const bytes = Buffer.from(file);
        const detectLabelsCommand = new DetectLabelsCommand({
            Image: {
                Bytes: bytes
            },
            MaxLabels: 10,
            MinConfidence: 90
        });
        const detectLabelsResponse: DetectLabelsCommandOutput = await this.rekognitionClient.send(detectLabelsCommand);
        const hasObject = detectLabelsResponse.Labels?.some(label =>
            validLabels.includes(label.Name || '')
        );

        return hasObject;
    }

    public async batchImageUpload(files: any[], fileKey: string[], bucketName: BucketName, directoryPath: string = ''): Promise<any> {
        console.log({fileKey});
        const urls: string[] = []
        await Promise.all(files.map((file: any, index: any) =>
            {
                const uploadData = {
                    bucketName: bucketName,
                    directoryPath: `${directoryPath}/`,
                    fileName: fileKey[index],
                    fileBody: file,
                    contentType: FileFormat.JPEG,
                }

                this.uploadFile(uploadData)
                .then((result: any) => console.log(result));
                
            const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey[index]}`;
            urls.push(fileUrl);
            }
        ));
        console.log({files});
        return urls;
    }

    public async batchImageDelete(fileKeys: string[], bucketName: BucketName, directoryPath: string = ''): Promise<string[]> {
        console.log({ fileKeys });
        const deletedKeys: string[] = [];
    
        await Promise.all(fileKeys.map(async (fileKey: string) => {
          const fullPath = `${directoryPath}/${fileKey}`.replace(/^\/+/, '');
          try {
            await this.removeFile({
              bucketName,
              fileName: fullPath,
            });
            deletedKeys.push(fullPath);
            console.log(`Successfully deleted: ${fullPath}`);
            return deletedKeys;
          } catch (error) {
            console.error(`Failed to delete ${fullPath}:`, error);
          }
        }));
    
        console.log({ deletedKeys });
        return deletedKeys;
      }
    

    public async selfieUpload(file: Express.Multer.File, fileKey: string): Promise<any> {
        console.log({fileKey}, file.mimetype);
        const uploadData = {
            bucketName: BucketName.VERIFICATION,
            directoryPath: `facialrecognition/`,
            fileName: fileKey,
            fileBody: file.buffer as Buffer,
            contentType: file.mimetype,
        }
        await this.uploadFile(uploadData);
    }

    public async extractDocumentText(fileKey: string): Promise<any> {
        const detectTextCommand = new DetectTextCommand({
            Image: 
            { 
                S3Object: {
                Bucket: BucketName.VERIFICATION,
                Name: fileKey,
            },
            
         },
         Filters: {
            WordFilter: {
                MinConfidence: 80
            }
         }
        });
        const detectTextResponse: DetectTextCommandOutput = await this.rekognitionClient.send(detectTextCommand);
        if(detectTextResponse.$metadata.httpStatusCode !== 200){
            throw new ValidationError(ResponseMessage.INVALID_DOCUMENT_UPLOAD);
        }
        const textLines = detectTextResponse.TextDetections?.filter(text => text.Type === "LINE")
        .map(text => text.DetectedText ?? "")
        .filter(text => text !== "") ?? [];

        // Validate if it's a driver's license
       return textLines;
    }
    public async extractLicenseDocumentText(fileKey: string): Promise<any> {
        const detectTextCommand = new DetectTextCommand({
            Image: 
            { 
                S3Object: {
                Bucket: BucketName.VERIFICATION,
                Name: fileKey,
            },
            
         },
         Filters: {
            WordFilter: {
                MinConfidence: 90
            }
         }
        });
        const detectTextResponse: DetectTextCommandOutput = await this.rekognitionClient.send(detectTextCommand);
        if(detectTextResponse.$metadata.httpStatusCode !== 200){
            throw new ValidationError(ResponseMessage.ERROR_MESSAGE);
        }
        const textLines = detectTextResponse.TextDetections?.filter(text => text.Type === "LINE")
        .map(text => text.DetectedText ?? "")
        .filter(text => text !== "") ?? [];

        // Validate if it's a driver's license
       return textLines;
    }

    public async analyzeDocuments(documentKeyTarget: string, documentKeySource: string){
        const compareFacesCommand = new CompareFacesCommand({
            SourceImage: { S3Object: { Bucket: BucketName.VERIFICATION, Name: documentKeySource }},
            TargetImage: { S3Object: { Bucket: BucketName.VERIFICATION, Name: documentKeyTarget }}
        });

        const compareFacesResponse = await this.rekognitionClient.send(compareFacesCommand);

        const faceMatches = (compareFacesResponse.FaceMatches as CompareFacesMatch[])[0];
        const compareFacesMatchSimilarity = faceMatches.Similarity as number;
        const compareFacesMatchFaces = faceMatches.Face as ComparedFace;
        return [
            compareFacesMatchSimilarity,
            compareFacesMatchFaces
        ]
    }

    public async compareFaces(sourceImage: string, targetImage: string){
        const bucketName = BucketName.VERIFICATION;
        try{

            console.log("Got here!!! -> AWSHelper::compareFaces",{targetImage}, {sourceImage});
            const command = new CompareFacesCommand({
                SourceImage: { S3Object: { Bucket: bucketName, Name: sourceImage} },
                TargetImage: {  S3Object: { Bucket: bucketName, Name: targetImage} },
                SimilarityThreshold: 80,
            });
            
            const response = await this.rekognitionClient.send(command);
            console.log("Compare Faces: ", {response});
            return response;
        }catch(err: any){
            console.log("AWSHelper::compareFaces(): error =>  ", err.message);

        }
    }
    //==================//
    // Helper Functions //
    //==================//



}


