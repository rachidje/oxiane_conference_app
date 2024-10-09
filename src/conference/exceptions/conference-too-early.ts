import { DomainError } from "../../shared/exception";


export class ConferenceTooEarlyError extends DomainError {
    constructor() {
        super("The conference is too early (less than 3 days)")
    }
}