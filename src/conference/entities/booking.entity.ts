
type BookingProps = {
    id: string
    userId: string,
    conferenceId: string
}

export class Booking {
    constructor(public props: BookingProps) {}
}