import { Model } from "mongoose";
import { Booking } from "../../entities/booking.entity";
import { IBookingRepository } from "../../ports/booking-repository.interface";
import { MongoBooking } from "./mongo-booking";

class BookingMapper {
    toCore(bookingDoc: MongoBooking.BookingDocument) : Booking {
        return new Booking({
            id: bookingDoc._id,
            conferenceId: bookingDoc.conferenceId,
            userId: bookingDoc.userId
        })
    }

    toPersistence(booking: Booking) : MongoBooking.BookingDocument {
        return new MongoBooking.BookingModel({
            _id: booking.props.id,
            conferenceId: booking.props.conferenceId,
            userId: booking.props.userId,
        })
    }
}


export class MongoBookingRepository implements IBookingRepository {

    private readonly mapper = new BookingMapper()

    constructor(
        private readonly model: Model<MongoBooking.BookingDocument>
    ) {}

    async create(booking: Booking): Promise<void> {
        const bookingDoc = this.mapper.toPersistence(booking)
        await bookingDoc.save()
    }

    async findById(id: string): Promise<Booking | null> {
        const booking = await this.model.findOne({_id: id})

        if(!booking) return null;

        return this.mapper.toCore(booking)
    }

    async update(booking: Booking): Promise<void> {
        const bookingDoc = this.mapper.toPersistence(booking)
        await this.model.updateOne({_id: booking.props.id}, bookingDoc)
    }

    async delete(booking: Booking): Promise<void> {
        await this.model.deleteOne({_id: booking.props.id})
    }

    async findOne(userId: string, conferenceId: string): Promise<Booking | null> {
        const booking = await this.model.findOne({userId, conferenceId})
        if(!booking) return null

        return this.mapper.toCore(booking)
    }

    async findByConferenceId(id: string): Promise<Booking[]> {
        const bookings = await this.model.find({conferenceId: id})
        return bookings.map(booking => this.mapper.toCore(booking))
    }
}