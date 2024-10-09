import { IDateGenerator } from "../../core/ports/date-generator.interface";
import { IIDGenerator } from "../../core/ports/id-generator.interface";
import { ImessageBroker } from "../../core/ports/message-broker.interface";
import { DomainError } from "../../shared/exception";
import { IExecutable } from "../../shared/executable.interface";
import { User } from "../../user/user.entity";
import { Conference } from "../entities/conference.entity";
import { ConferenceTooEarlyError } from "../exceptions/conference-too-early";
import { IConferenceRepository } from "../ports/conference-repository.interface";

type OrganizeConferenceRequest = {
    user: User,
    title: string,
    seats: number,
    startDate: Date,
    endDate: Date,
}

type OrganizeConferenceResponse = {
    id: string
}


export class OrganizeConference implements IExecutable<OrganizeConferenceRequest, OrganizeConferenceResponse> {
    constructor(
        private readonly repository: IConferenceRepository,
        private readonly idGenerator: IIDGenerator,
        private readonly dateGenerator: IDateGenerator,
        private readonly messageBroker: ImessageBroker
    ) {}

    async execute({user, title, seats, startDate, endDate}: OrganizeConferenceRequest): Promise<OrganizeConferenceResponse> {
        const id = this.idGenerator.generate()
        const conference = new Conference({
            id: id,
            organizerId: user.props.id,
            title: title,
            seats: seats,
            startDate: startDate,
            endDate: endDate
        })
        
        if(conference.isTooEarly(this.dateGenerator.now())) {
            throw new ConferenceTooEarlyError()
        } 

        if(conference.hasTooManySeats()) {
            throw new DomainError("The conference must have a maximum of 1000 seats")
        }

        if(conference.hasNotEnoughSeats()) {
            throw new DomainError("The conference must have a minimum of 20 seats")
        }

        if(conference.isTooLong()) {
            throw new DomainError("The conference is too long (> 3 hours)")
        }

        this.repository.create(conference)

        await this.messageBroker.publish('conference_created', {
            conferenceId: conference.props.id,
            organizerEmail: user.props.email,
            title: title,
            seats: seats
        })


        return { id }
    }
}