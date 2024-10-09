

export class ConferenceNotFoundError extends Error {
    constructor() {
        super("Conference not found")
    }
}