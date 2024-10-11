import { Booking } from "../../conference/entities/booking.entity"
import { ResolveDependencyFn } from "../../infrastructure/config/dependecy-injection"
import { IFixture } from "../utils/fixture.interface"

export class BookingFixture implements IFixture {
    constructor(public entity: Booking) {}

    async load(container: ResolveDependencyFn): Promise<void> {
        const repository = container('bookingRepository')
        await repository.create(this.entity)
    }

}