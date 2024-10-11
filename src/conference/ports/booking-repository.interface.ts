import { Booking } from "../entities/booking.entity";


export interface IBookingRepository {
    create(booking: Booking): Promise<void>
    findByConferenceId(id: string): Promise<Booking[]>
    findById(id: string): Promise<Booking | null>
    findOne(userId: string, conferenceId: string): Promise<Booking | null>
    delete(booking: Booking): Promise<void>
}