import { NextFunction, Request, Response } from "express";
import container from "../config/dependecy-injection";
import { extractToken } from "../utils/extract-token";


declare module 'express-serve-static-core' {
    interface Request {
        user?: any
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credentials = req.headers.authorization
        
        if(!credentials) return res.jsonError('Unauthorized', 403)
        
        const token = extractToken(credentials)
        if(!token) return res.jsonError("Unauthorized", 403)
        
        const user = await container('authenticator').authenticate(token)
        if(!user) return res.jsonError("Unauthorized", 403)

        req.user = user
        next()
    } catch (error) {
        next(error);
    }
};