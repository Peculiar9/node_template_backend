import { Request, Response, NextFunction } from "express";
import BaseMiddleware from "./BaseMiddleware";
import { ResponseMessage } from "../Core/Application/Response/ResponseFormat";
import BaseResponseHandler from "./ResponseHandlerMiddleware";

export class RateLimiter extends BaseMiddleware {

    constructor() {
        super();
    }

    protected static requestCounts: { [key: string]: RequestCount } = {};


    /**
     * Creates a rate limiting middleware function.
     * @param {string} paramKey - The query parameter key to use for identifying requests (in addition to IP).
     * @param {RateLimitOptions} options - The rate limiting options.
     * @param {number} options.windowMs - The time window in minutes for rate limiting.
     * @param {number} options.maxRequests - The maximum number of requests allowed within the time window.
     * @returns {Function} A middleware function that implements rate limiting.
     */
    public static rateLimitingPipeline(paramKey: string, { windowMs, maxRequests }: RateLimitOptions) {
        const requestCounts = RateLimiter.requestCounts || {};
        const rateLimitWindow = windowMs * 60 * 1000;
        return function rateLimiter(req: Request, res: Response, next: NextFunction) {
            const paramValue = req?.query[paramKey ?? ''] ?? '';

            const identifier = `${req.ip}${paramValue}`; // Combine IP and paramValue for tracking

            if (!requestCounts[identifier]) {
                requestCounts[identifier] = { count: 1, startTime: Date.now() };
            } else {
                requestCounts[identifier].count += 1;
            }

            const elapsedTime = Date.now() - requestCounts[identifier].startTime;

            if (elapsedTime < rateLimitWindow) {
                if (requestCounts[identifier].count > maxRequests) {
                    BaseResponseHandler.SimpleCustomResponse(res, {}, ResponseMessage.RATE_LIMIT_ERROR, 429, 12)
                }
            } else {
                requestCounts[identifier] = { count: 1, startTime: Date.now() };
            }
            next();
        };

    }
}

export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
}

export interface RequestCount {
    count: number;
    startTime: number;
}
