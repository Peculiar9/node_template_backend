import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { IBaseHTTPClient } from "../../Core/Interfaces/APIs/IBaseHTTPClient";
import { injectable } from "inversify";

@injectable()
export default class BaseHTTPClient implements IBaseHTTPClient{
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string, extraHeaders: Record<any, string>){

        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...extraHeaders
        }
        this.axiosInstance = axios.create({
            baseURL,
            headers: defaultHeaders,
        });
    }

    get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }
    post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }
    put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config);
    }
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config);
    }

    //TODO: improve this patch function
    patch<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, config);
    }
    
}
    
    