import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository";
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository";
import { Booking } from "../entities/booking.entity";
import { testBookings } from "../tests/test-bookings";
import { testConference } from "../tests/test-conferences";
import { testUsers } from "../tests/test-users";
import { ChangeSeats } from "./change-seats";


describe('Feature: Change seats', () => {

    let usecase : ChangeSeats;
    let conferenceRepository: InMemoryConferenceRepository
    let bookingRepository: InMemoryBookingRepository

    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository()
        await conferenceRepository.create(testConference.conference1)

        bookingRepository = new InMemoryBookingRepository()

        usecase = new ChangeSeats(conferenceRepository, bookingRepository)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            seats: 200,
            user: testUsers.johnDoe
        }

        it('should update the number of seats', async () => {
            await usecase.execute(payload)

            const fetchedConference = await conferenceRepository.findById(testConference.conference1.props.id)
            expect(fetchedConference).toBeDefined()
            expect(fetchedConference!.props.seats).toEqual(payload.seats)
        })
    })

    describe('Scenario: The conference does not exist', () => {
        const payload = {
            conferenceId : 'non-existing-id',
            seats: 200,
            user: testUsers.johnDoe
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference not found")
        })
    })

    describe('Scenario: Never less than already booked', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            seats: 49,
            user: testUsers.johnDoe
        }
        it('should fail', async () => {
            for(let i = 0; i <= 50; i++) {
                await bookingRepository.create(new Booking({
                    id: `id-${i}`,
                    userId: `id-${i}`,
                    conferenceId: testConference.conference1.props.id
                }))
            }
            await expect(usecase.execute(payload)).rejects.toThrow('You can not set less than already booked seats')
        })
    })

    describe('Scenario: The conference has not enough seats', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            seats: 19,
            user: testUsers.johnDoe
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("The conference must have a minimum of 20 seats")
        })
    })

    
    describe('Scenario: The conference has too many seats', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            seats: 1001,
            user: testUsers.johnDoe
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("The conference must have a maximum of 1000 seats")
        })
    })
})