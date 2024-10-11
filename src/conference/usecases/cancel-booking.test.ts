import { InMemoryMailer } from "../../core/adapters/in-memory-mailer"
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository"
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository"
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository"
import { testBookings } from "../tests/test-bookings"
import { testConference } from "../tests/test-conferences"
import { testUsers } from "../tests/test-users"
import { CancelBooking } from "./cancel-booking"


describe("Feature: Cancel Booking", () => {
    let usecase: CancelBooking
    let bookingRepository: InMemoryBookingRepository
    let mailer: InMemoryMailer
    let userRepository: InMemoryUserRepository
    let conferenceRepository: InMemoryConferenceRepository

    beforeEach(async () => {
        bookingRepository = new InMemoryBookingRepository()
        bookingRepository.create(testBookings.aliceBooking)

        userRepository = new InMemoryUserRepository()
        userRepository.create(testUsers.johnDoe)
        userRepository.create(testUsers.alice)

        conferenceRepository = new InMemoryConferenceRepository()
        conferenceRepository.create(testConference.conference1)

        mailer = new InMemoryMailer()
        usecase = new CancelBooking(bookingRepository, mailer, userRepository, conferenceRepository)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            user: testUsers.alice
        }
        it('should delete a booking', async () => {
            await usecase.execute(payload)

            const deletedBooking = await bookingRepository.findById(testBookings.aliceBooking.props.id)

            expect(deletedBooking).toBeNull()
        })
        it('should send an email to the Organizer', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails[0]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.johnDoe.props.email,
                subject: 'Cancelling booking',
                body: `You have a cancel booking in your conference: ${testConference.conference1.props.title}`
            })

        })
        it('should send an email to the Participant', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails[1]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.alice.props.email,
                subject: 'Cancelling booking',
                body: `Your booking to the conference: ${testConference.conference1.props.title} has been cancelled`
            })
        })
    })
    describe('Scenario: Conference does not exist', () => {
        const payload = {
            conferenceId: 'non-existing-id',
            user: testUsers.alice
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference not found")
        })
    })
    describe('Scenario: The user does not book a seat', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            user: testUsers.bob
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("You did not book this conference")
        })
    })
})