import { IMailer } from "../../core/ports/mailer.interface"
import { IExecutable } from "../../shared/executable.interface"
import { IUserRepository } from "../../user/ports/user-repository.interface"
import { User } from "../../user/user.entity"
import { Conference } from "../entities/conference.entity"
import { ConferenceNotFoundError } from "../exceptions/conference-not-found"
import { IBookingRepository } from "../ports/booking-repository.interface"
import { IConferenceRepository } from "../ports/conference-repository.interface"

type CancelConferenceRequest = {
    conferenceId: string
    user: User
}

type CancelConferenceResponse = void

export class CancelConference implements IExecutable<CancelConferenceRequest, CancelConferenceResponse> {
    constructor(
        private readonly conferenceRepository: IConferenceRepository,
        private readonly mailer: IMailer,
        private readonly bookingRepository: IBookingRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async execute({conferenceId, user}: CancelConferenceRequest): Promise<void> {
        const conference = await this.conferenceRepository.findById(conferenceId)
        if(!conference) throw new ConferenceNotFoundError()
        if(!conference.isTheOrganizer(user)) throw new Error("You are not allowed to delete this conference")

        await this.conferenceRepository.delete(conference!)
        await this.sendEmailToParticipants(conference!)

    }

    private async sendEmailToParticipants(conference: Conference) {
        const bookings = await this.bookingRepository.findByConferenceId(conference.props.id)
        const participants = await Promise.all(
            bookings.map(booking => this.userRepository.findById(booking.props.userId))
                    .filter(pariticpant => pariticpant !== null)
        ) as User[]

        await Promise.all(
            participants.map(participant => {
                this.mailer.send({
                    from: "TEDx Conference",
                    to: participant.props.email,
                    subject: `Cancelling conference`,
                    body: `The conference ${conference.props.title} was cancelled`
                })
            })
        )
    }
}