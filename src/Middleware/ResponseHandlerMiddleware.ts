import ResponseFormat, { ResponseDataInterface, ResponseMessage } from "../Core/Application/Response/ResponseFormat";
import { Request, Response } from "express";
import { injectable } from 'inversify';
import { AppError, UnprocessableEntityError } from "../Core/Application/Error/AppError";
import { pipeline, Readable } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

@injectable()
abstract class BaseResponseHandler {
    protected responseMessage: ResponseFormat;

    constructor() {
        this.responseMessage = new ResponseFormat();
    }


    // protected sendSuccessResponse(res: Response, message = this.responseMessage.SUCCESSFUL_REQUEST_MESSAGE, meta_data = {}){
    //     return res.json();
    // }

    protected async FileDownloadResponse(res: Response, metaData: any, dataStream: Readable, fileName: string, mimeType: string) {
        const name = `${fileName ?? "data"}.${mimeType}`;
        res.setHeader('Content-Type', `text/${mimeType}`);
        res.setHeader('Content-Disposition', `attachment; filename=${name}`);
    
        try {
            // Stream the CSV data to the response
            await pipelineAsync(dataStream, res);
            console.log(`File download completed: ${name}`);
        } catch (err: any) {
            console.error(`Error during file download: ${err.message}`);
    
            // Only send error response if headers haven't been sent yet
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: ResponseMessage.FILE_DOWNLOAD_ERROR_MESSAGE,
                    data: {},
                    error_code: 500
                });
            }
        }
    }

    protected static SimpleCustomResponse(res: Response, metaData: any, message: string, statusCode: number, error_code: number = 0) {
        const responseData: ResponseDataInterface = {
            success: statusCode >= 200 && statusCode < 300,
            message: message ?? ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE,
            data: metaData ?? {},
            error_code: error_code ?? 0
        } 
        return res.status(statusCode).json(responseData);
    }
    protected SimpleSuccessResponse(res: Response, metaData: any, message: string) {
        const responseData: ResponseDataInterface = {
            success: true,
            message: message ?? ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE,
            data: metaData ?? {},
            error_code: 0
        } 
        return res.status(200).json(responseData);
    }
    protected RenderPageResponse(res: Response, meta: any, path: string) {
        return res.status(200).render(path, meta);
    }
    protected RedirectPageResponse(res: Response, path: string) {
        return res.status(200).redirect(path);
    }
    protected SimpleSuccessResponseList(res: Response, metaData: any, listData: any, message: string) {
        const responseData: ResponseDataInterface = {
            success: true,
            message: message ?? ResponseMessage.SUCCESSFUL_REQUEST_MESSAGE,
            data: metaData ?? {},
            meta: listData,
            error_code: 0
        } 
        return res.status(200).json(responseData);
    }
    protected logAndSendSimpleResponse(err: any, res: Response, statusCode: number, responseDataInterface?: ResponseDataInterface) {
        if (err instanceof AppError) {
            const responseData: ResponseDataInterface = {
                success: false,
                message: err.message,
                data: {},
                error_code: err.errorCode
            }
            return res.status(err.statusCode).json(responseData);
        }
        
         // Fallback for unknown errors
        const responseData: ResponseDataInterface = responseDataInterface || {
            success: false,
            message: err.message ?? ResponseMessage.INVALID_REQUEST_MESSAGE,
            data: {},
            error_code: 0
        } 
        return res.status(statusCode).json(responseData);
    }

    protected HandleEmptyReqBody(req: Request): void {
        if (!req || req.body === undefined) {
          throw new UnprocessableEntityError(ResponseMessage.MISSING_REQUEST_BODY);
        }
        if (
          (typeof req.body === 'object' && Object.keys(req.body).length === 0) ||
          (Array.isArray(req.body) && req.body.length === 0) ||
          req.body === ''
        ) {
          throw new UnprocessableEntityError(ResponseMessage.MISSING_REQUEST_BODY);
        }
      }

}

export default BaseResponseHandler;


