import { NextFunction, Request, Response } from "express";
import { ResolveDependencyFn } from "../config/dependecy-injection";
import { RegisterUserInputs } from "../dto/user.dto";
import { RequestValidator } from "../utils/validate-request";

export const registerUser = (container: ResolveDependencyFn) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {errors, input} = await RequestValidator(RegisterUserInputs, req.body)
    
            if(errors) {
                return res.jsonError(errors, 400)
            }

            const result = await container('registerUser').execute(input)

            return res.jsonSuccess({id: result.id}, 201)
        } catch (error) {
            next(error);
        }
    };
}