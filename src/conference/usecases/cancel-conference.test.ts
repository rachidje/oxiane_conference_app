import { InMemoryMailer } from "../../core/adapters/in-memory-mailer";
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository";
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository";
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository";
import { testBookings } from "../tests/test-bookings";
import { testConference } from "../tests/test-conferences";
import { testUsers } from "../tests/test-users";
import { CancelConference } from "./cancel-conference";


describe('Feature: Cancel Conference', () => {

    let conferenceRepository: InMemoryConferenceRepository
    let usecase: CancelConference;
    let mailer: InMemoryMailer;
    let bookingRepository: InMemoryBookingRepository
    let userRepository: InMemoryUserRepository

    beforeEach(async () => {
        conferenceRepository = new InMemoryConferenceRepository()
        conferenceRepository.create(testConference.conference1)

        bookingRepository = new InMemoryBookingRepository()
        bookingRepository.create(testBookings.aliceBooking)
        bookingRepository.create(testBookings.bobBooking)

        userRepository = new InMemoryUserRepository()
        userRepository.create(testUsers.alice)
        userRepository.create(testUsers.bob)

        mailer = new InMemoryMailer()

        usecase = new CancelConference(conferenceRepository, mailer, bookingRepository, userRepository)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            user: testUsers.johnDoe
        }
        it('should delete the conference', async () => {
            await usecase.execute(payload)

            const deletedConference = await conferenceRepository.findById(testConference.conference1.props.id)
            expect(deletedConference).toBeNull()

        })
        it('should send en email to all participants', async () => {
            await usecase.execute(payload)

            expect(mailer.sentEmails).toHaveLength(2)
            expect(mailer.sentEmails[0]).toEqual({
                from: "TEDx Conference",
                to: testUsers.alice.props.email,
                subject: `Cancelling conference`,
                body: `The conference ${testConference.conference1.props.title} was cancelled`
            })
        })
    })
    describe('Scenario: Conference does not exist', () => {
        const payload = {
            conferenceId: 'non-existing-id',
            user: testUsers.johnDoe
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("Conference not found")
        })
    })
    describe('Scenario: Cancel conference of someone else', () => {
        const payload = {
            conferenceId: testConference.conference1.props.id,
            user: testUsers.alice
        }
        it('should fail', async () => {
            await expect(usecase.execute(payload)).rejects.toThrow("You are not allowed to delete this conference")
        })
    })
})