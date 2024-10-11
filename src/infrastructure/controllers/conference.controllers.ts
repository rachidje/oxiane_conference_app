import { NextFunction, Request, Response } from "express";
import { User } from "../../user/user.entity";
import { ResolveDependencyFn } from "../config/dependecy-injection";
import { ChangeDatesInputs, ChangeSeatsInputs, CreateConferenceInputs } from "../dto/conference.dto";
import { RequestValidator } from "../utils/validate-request";


export const createConference = (container: ResolveDependencyFn) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {errors, input} = await RequestValidator(CreateConferenceInputs, req.body)
    
            if(errors) {
                return res.jsonError(errors, 400)
            }

            const messageBroker = container('messageBroker')
            await messageBroker.connect()
    
            const result = await container('organizeConference').execute({
                user: req.user,
                title: input.title,
                seats: input.seats,
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate)
            })

            await messageBroker.close()
    
            return res.jsonSuccess(result, 201)
        } catch (error) {
            next(error);
        }
    };
}

export const changeDates = (container: ResolveDependencyFn) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { conferenceId } = req.params
            const {errors, input} = await RequestValidator(ChangeDatesInputs, req.body)
    
            if(errors) {
                return res.jsonError(errors, 400)
            }

            await container('changeDates').execute({
                user: req.user as User,
                conferenceId,
                startDate: new Date(input.startDate),
                endDate: new Date(input.endDate)
            })

            return res.jsonSuccess({message: `Dates changed for conference with id: ${conferenceId}`}, 200)

        } catch (error) {
            next(error);
        }
    };
}

export const bookSeat = (container: ResolveDependencyFn) => {
    return  async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { conferenceId } = req.params

            const result = await container('bookSeat').execute({
                user: req.user,
                conferenceId
            })

            return res.jsonSuccess({bookId: result.bookId}, 201)
        } catch (error) {
            next(error);
        }
    };
}

export const changeSeats = (container: ResolveDependencyFn) => {
    return  async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { conferenceId } = req.params
            const {errors, input} = await RequestValidator(ChangeSeatsInputs, req.body)

            if(errors) {
                return res.jsonError(errors, 400)
            }

            await container('changeSeats').execute({
                user: req.user,
                seats: input.seats,
                conferenceId
            })

            return res.jsonSuccess({message: `The number of seats for conference: ${conferenceId} was updated`}, 200)
        } catch (error) {
            next(error);
        }
    };
}

export const cancelConference = (container: ResolveDependencyFn) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {conferenceId} = req.params

            await container('cancelConference').execute({
                conferenceId,
                user: req.user
            })

            return res.jsonSuccess({message: `The conference: ${conferenceId} was correctly deleted`}, 200)
        } catch (error) {
            next(error);
        }
    };
}