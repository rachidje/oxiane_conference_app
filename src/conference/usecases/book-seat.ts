import { IIDGenerator } from "../../core/ports/id-generator.interface";
import { IMailer } from "../../core/ports/mailer.interface";
import { IExecutable } from "../../shared/executable.interface";
import { IUserRepository } from "../../user/ports/user-repository.interface";
import { User } from "../../user/user.entity";
import { Booking } from "../entities/booking.entity";
import { Conference } from "../entities/conference.entity";
import { ConferenceNotFoundError } from "../exceptions/conference-not-found";
import { IBookingRepository } from "../ports/booking-repository.interface";
import { IConferenceRepository } from "../ports/conference-repository.interface";


type BookSeatRequest = {
    conferenceId: string
    user: User;
}

type BookSeatResponse = {
    bookId: string
}

export class BookSeat implements IExecutable<BookSeatRequest, BookSeatResponse> {

    constructor(
        private readonly idGenerator: IIDGenerator,
        private readonly bookRepository: IBookingRepository,
        private readonly mailer: IMailer,
        private readonly conferenceRepository: IConferenceRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async execute({user, conferenceId}: BookSeatRequest): Promise<BookSeatResponse> {
        const conference = await this.conferenceRepository.findById(conferenceId)

        if(!conference) throw new ConferenceNotFoundError()
        
        await this.assertUserIsNotAlreadyBooked(user, conference)
        await this.assertSeatsAreAvailable(conference)

        const booking = new Booking({
            id: this.idGenerator.generate(), 
            userId: user.props.id, 
            conferenceId
        })

        await this.bookRepository.create(booking)

        await this.sendEmailToOrganizer(conference)
        await this.sendEmailToParticipant(user, conference)

        return { bookId: booking.props.id }
    }

    private async assertUserIsNotAlreadyBooked(user: User, conference: Conference) {
        const existingBooking = await this.bookRepository.findOne(user.props.id, conference.props.id)
        if(existingBooking) throw new Error("You already book a seat for this conference")
    }

    private async assertSeatsAreAvailable(conference: Conference) {
        const bookings = await this.bookRepository.findByConferenceId(conference.props.id)
        if(bookings.length >= conference.props.seats) throw new Error("The conference is full")
    }

    private async sendEmailToOrganizer(conference: Conference) {
        const organizer = await this.userRepository.findById(conference.props.organizerId)
        await this.mailer.send({
            from: 'TEDx Conference',
            to: organizer!.props.email,
            subject: 'A new booking!',
            body: `A participant books a place to your conference: ${conference.props.title} !`
        })
    }

    private async sendEmailToParticipant(user: User, conference: Conference) {
        await this.mailer.send({
            from: 'TEDx Conference',
            to: user.props.email,
            subject: 'New Booking',
            body: `Your booking to the conference: ${conference.props.title} was confirmed !`
        })
    }
}