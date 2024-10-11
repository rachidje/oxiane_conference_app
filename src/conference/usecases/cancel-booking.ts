import { IMailer } from "../../core/ports/mailer.interface"
import { IExecutable } from "../../shared/executable.interface"
import { IUserRepository } from "../../user/ports/user-repository.interface"
import { User } from "../../user/user.entity"
import { Conference } from "../entities/conference.entity"
import { ConferenceNotFoundError } from "../exceptions/conference-not-found"
import { IBookingRepository } from "../ports/booking-repository.interface"
import { IConferenceRepository } from "../ports/conference-repository.interface"

type CancelBookRequest = {
    conferenceId: string
    user: User
}

type CancelBookResponse = void

export class CancelBooking implements IExecutable<CancelBookRequest, CancelBookResponse> {

    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly mailer: IMailer,
        private readonly userRepository: IUserRepository,
        private readonly conferenceRepository: IConferenceRepository
    ) {}

    async execute({conferenceId, user}: CancelBookRequest): Promise<void> {
        const conference = await this.conferenceRepository.findById(conferenceId)
        if(!conference) throw new ConferenceNotFoundError()
        
        const booking = await this.bookingRepository.findOne(user.props.id, conferenceId)
        if(!booking) throw new Error("You did not book this conference")

        await this.bookingRepository.delete(booking)
        
        await this.sendEmailToOrganizer(conference)
        await this.sendEmailToParticipant(conference, user)
    }

    private async sendEmailToOrganizer(conference: Conference) {
        const organizer = await this.userRepository.findById(conference.props.organizerId)

        await this.mailer.send({
            from: 'TEDx Conference',
            to: organizer!.props.email,
            subject: 'Cancelling booking',
            body: `You have a cancel booking in your conference: ${conference.props.title}`
        })
    }

    private async sendEmailToParticipant(conference: Conference, user: User) {
        const participant = await this.userRepository.findById(user.props.id)

        await this.mailer.send({
            from: 'TEDx Conference',
            to: participant!.props.email,
            subject: 'Cancelling booking',
            body: `Your booking to the conference: ${conference.props.title} has been cancelled`
        })
    }
}