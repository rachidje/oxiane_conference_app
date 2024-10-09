

export class ConferenceUpdateForbiddenError extends Error {
    constructor() {
        super("You are note allowed to change this conference")
    }
}