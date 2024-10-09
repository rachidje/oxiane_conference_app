import { FixedIDGenerator } from "../../core/adapters/fixed-id-generator"
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer"
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository"
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository"
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository"
import { testBookings } from "../tests/test-bookings"
import { testConference } from "../tests/test-conferences"
import { testUsers } from "../tests/test-users"
import { BookSeat } from "./book-seat"


describe('Feature: Book seat', () => {
    let userRepository: InMemoryUserRepository
    let conferenceRepository: InMemoryConferenceRepository
    let bookRepository: InMemoryBookingRepository
    let idGenerator: FixedIDGenerator
    let mailer: InMemoryMailer

    let usecase: BookSeat

    beforeEach(async() => {
        userRepository = new InMemoryUserRepository()
        userRepository.create(testUsers.johnDoe)
        userRepository.create(testUsers.alice)

        conferenceRepository = new InMemoryConferenceRepository()
        conferenceRepository.create(testConference.conference1)
        conferenceRepository.create(testConference.conferenceWithFewSeats)

        bookRepository = new InMemoryBookingRepository()
        bookRepository.create(testBookings.bobBooking)
        bookRepository.create(testBookings.charlesBooking)

        idGenerator = new FixedIDGenerator()
        mailer = new InMemoryMailer()

        usecase = new BookSeat(idGenerator, bookRepository, mailer, conferenceRepository, userRepository)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            user: testUsers.alice,
            conferenceId: testConference.conference1.props.id
        }

        it('should book a seat', async () => {
            const result = await usecase.execute(payload)

            expect(result.bookId).toEqual('id-1')

            const fetchedBooking = await bookRepository.findById(result.bookId)

            expect(fetchedBooking).toBeDefined()
            expect(fetchedBooking!.props.userId).toEqual(payload.user.props.id)
            expect(fetchedBooking!.props.conferenceId).toEqual(payload.conferenceId)
        })

        it('should send an email to the organizer', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails[0]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.johnDoe.props.email,
                subject: 'A new booking!',
                body: `A participant books a place to your conference: ${testConference.conference1.props.title} !`
            })
        })

        it('should send an email to the participant', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails[1]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.alice.props.email,
                subject: 'New Booking',
                body: `Your booking to the conference: ${testConference.conference1.props.title} was confirmed !`
            })
        })
    })

    describe('Scenario: The conference does not exist', () => {
        const payload = {
            user: testUsers.alice,
            conferenceId: 'non-existing-id'
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference not found")
        })
    })

    describe('Scenario: Participant already book a seat', () => {
        const payload = {
            user: testUsers.bob,
            conferenceId: testConference.conference1.props.id
        }

        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('You already book a seat for this conference')
        })
    })

    describe('Scenario: The conference is full', () => {
        const payload = {
            user: testUsers.alice,
            conferenceId: testConference.conferenceWithFewSeats.props.id
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("The conference is full")
        })
    })
})