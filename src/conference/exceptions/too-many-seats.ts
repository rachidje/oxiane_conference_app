import { DomainError } from "../../shared/exception";


export class ConferenceHasTooManySeats extends DomainError {
    constructor() {
        super("The conference must have a maximum of 1000 seats")
    }
}