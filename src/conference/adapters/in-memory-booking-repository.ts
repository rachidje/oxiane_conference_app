import { Booking } from "../entities/booking.entity";
import { IBookingRepository } from "../ports/booking-repository.interface";


export class InMemoryBookingRepository implements IBookingRepository {
    public database: Booking[] = []

    async create(booking: Booking): Promise<void> {
        this.database.push(booking)
    }

    async findByConferenceId(id: string): Promise<Booking[]> {
        return this.database.filter(booking => booking.props.conferenceId === id)
    }

    async findById(id: string): Promise<Booking | null> {
        return this.database.find(booking => booking.props.id === id) ?? null
    }

    async findOne(userId: string, conferenceId: string): Promise<Booking | null> {
        return this.database.find(booking => booking.props.userId === userId && booking.props.conferenceId === conferenceId) ?? null
    }

    async delete(booking: Booking): Promise<void> {
        const index = this.database.findIndex(b => b.props.id === booking.props.id)
        this.database.splice(index, 1)
    }
}