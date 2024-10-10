import { IExecutable } from "../../shared/executable.interface"
import { User } from "../../user/user.entity"
import { ConferenceNotFoundError } from "../exceptions/conference-not-found"
import { ConferenceHasNotEnoughSeatsError } from "../exceptions/not-enough-seats"
import { ConferenceHasTooManySeats } from "../exceptions/too-many-seats"
import { IBookingRepository } from "../ports/booking-repository.interface"
import { IConferenceRepository } from "../ports/conference-repository.interface"

type ChangeSeatsRequest = {
    conferenceId: string
    seats: number
    user: User
}

type ChangeSeatsResponse = void


export class ChangeSeats implements IExecutable<ChangeSeatsRequest, ChangeSeatsResponse> {

    constructor(
        private readonly conferenceRepository: IConferenceRepository,
        private readonly bookingRepository: IBookingRepository
    ) {}

    async execute({conferenceId, seats, user}: ChangeSeatsRequest): Promise<void> {
        const conference = await this.conferenceRepository.findById(conferenceId)

        if(!conference) throw new ConferenceNotFoundError()
        const bookings = await this.bookingRepository.findByConferenceId(conferenceId)

        if(seats < bookings.length ) throw new Error("You can not set less than already booked seats")

        conference.update({seats})

        if(conference.hasNotEnoughSeats()) throw new ConferenceHasNotEnoughSeatsError()
        if(conference.hasTooManySeats()) throw new ConferenceHasTooManySeats()

        await this.conferenceRepository.update(conference)
    }
}