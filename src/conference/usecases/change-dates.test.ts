import { addDays, addHours } from "date-fns"
import { FixedDateGenerator } from "../../core/adapters/fixed-date-generator"
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer"
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository"
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository"
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository"
import { testBookings } from "../tests/test-bookings"
import { testConference } from "../tests/test-conferences"
import { testUsers } from "../tests/test-users"
import { ChangeDates } from "./change-dates"


describe('Feature: Changing dates', () => {
    let usecase: ChangeDates
    let conferenceRepository: InMemoryConferenceRepository
    let dateGenerator: FixedDateGenerator
    let bookingRepository: InMemoryBookingRepository
    let mailer: InMemoryMailer
    let userRepository: InMemoryUserRepository

    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository()
        await conferenceRepository.create(testConference.conference1)
        
        bookingRepository = new InMemoryBookingRepository()
        await bookingRepository.create(testBookings.bobBooking)
        await bookingRepository.create(testBookings.aliceBooking)

        userRepository = new InMemoryUserRepository()
        await userRepository.create(testUsers.bob)
        await userRepository.create(testUsers.alice)
        
        dateGenerator = new FixedDateGenerator()
        mailer = new InMemoryMailer()

        usecase = new ChangeDates(
            conferenceRepository, 
            dateGenerator, 
            bookingRepository, 
            mailer,
            userRepository
        )
    })

    describe('Scenario: Happy path', () => {
        const startDate = addDays(new Date(), 8)
        const endDate = addDays(addHours(new Date(), 2), 8)

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }
        it('should change dates', async () => {
            await usecase.execute(payload)

            const fetchedConference = await conferenceRepository.findById(testConference.conference1.props.id)
            expect(fetchedConference).toBeDefined()
            expect(fetchedConference!.props.startDate).toEqual(startDate)
            expect(fetchedConference!.props.endDate).toEqual(endDate)
        })

        it('should send an email to the participants', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails).toHaveLength(2)
            expect(mailer.sentEmails[0]).toEqual({
                from: 'TEDx Conference',
                to: testUsers.bob.props.email,
                subject: 'Changing dates',
                body: `The dates of the conference: ${testConference.conference1.props.title} was changed`
            })
        })
    })

    describe('Scenario: Conference does not exist', () => {
        const startDate = addDays(new Date(), 8)
        const endDate = addDays(addHours(new Date(), 2), 8)

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: 'non-existing-id',
            startDate,
            endDate
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('Conference not found')
        })
    })

    describe('Scenario: Update conference of someone else', () => {
        const startDate = addDays(new Date(), 8)
        const endDate = addDays(addHours(new Date(), 2), 8)

        const payload = {
            user: testUsers.bob,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('You are note allowed to change this conference')
        })
    })

    describe('Scenario: startDate is too early', () => {
        const startDate = new Date("2024-01-02T12:18:46.946Z")
        const endDate = new Date("2024-01-02T14:18:46.946Z")

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('The conference is too early')
        })
    })

    describe('Scenario: Conference is too long', () => {
        const startDate = new Date("2024-01-04T12:18:46.946Z")
        const endDate = new Date("2024-01-04T16:18:46.946Z")

        const payload = {
            user: testUsers.johnDoe,
            conferenceId: testConference.conference1.props.id,
            startDate,
            endDate
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow('The conference is too long')
        })
    })
})