import { DomainError } from "../../shared/exception";


export class ConferenceHasNotEnoughSeatsError extends DomainError {
    constructor() {
        super("The conference must have a minimum of 20 seats")
    }
}