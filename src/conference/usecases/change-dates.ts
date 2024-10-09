import { IDateGenerator } from "../../core/ports/date-generator.interface"
import { IMailer } from "../../core/ports/mailer.interface"
import { IExecutable } from "../../shared/executable.interface"
import { IUserRepository } from "../../user/ports/user-repository.interface"
import { User } from "../../user/user.entity"
import { Conference } from "../entities/conference.entity"
import { ConferenceNotFoundError } from "../exceptions/conference-not-found"
import { IBookingRepository } from "../ports/booking-repository.interface"
import { IConferenceRepository } from "../ports/conference-repository.interface"


type ChangeDatesRequest = {
    user: User,
    conferenceId: string,
    startDate: Date,
    endDate: Date
}

type ChangeDatesResponse = void


export class ChangeDates implements IExecutable<ChangeDatesRequest, ChangeDatesResponse> {
    constructor(
        private readonly conferenceRepository: IConferenceRepository,
        private readonly dateGenerator: IDateGenerator,
        private readonly bookingRepository: IBookingRepository,
        private readonly mailer: IMailer,
        private readonly userRepository: IUserRepository
    ) {}

    async execute({user, conferenceId, startDate, endDate}: ChangeDatesRequest): Promise<void> {
        const conference = await this.conferenceRepository.findById(conferenceId)

        if(!conference) throw new ConferenceNotFoundError()

        conference.update({
            startDate,
            endDate
        })

        if(conference.props.organizerId !== user.props.id) {
            throw new Error("You are note allowed to change this conference")
        }

        if(conference.isTooEarly(this.dateGenerator.now())) {
            throw new Error("The conference is too early")
        }

        if(conference.isTooLong()) {
            throw new Error("The conference is too long")
        }

        await this.conferenceRepository.update(conference)
        await this.sendEmailToParticipants(conference)
    }

    private async sendEmailToParticipants(conference: Conference) {
        const bookings = await this.bookingRepository.findByConferenceId(conference.props.id)
        const users = await Promise.all(
            bookings.map(booking => this.userRepository.findById(booking.props.userId))
                    .filter(user => user !== null)
        ) as User[]

        await Promise.all(
            users.map(
                user => {
                    this.mailer.send({
                        from: 'TEDx Conference',
                        to: user.props.email,
                        subject: 'Changing dates',
                        body: `The dates of the conference: ${conference.props.title} was changed`
                    })
                }
            )
        )
    }
}