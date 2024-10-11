import { Application } from 'express';
import request from 'supertest';
import { IBookingRepository } from '../conference/ports/booking-repository.interface';
import resolveDependency from '../infrastructure/config/dependecy-injection';
import { e2eBookings } from './seeds/booking-seeds';
import { e2eConferences } from './seeds/conference-seeds';
import { e2eUsers } from './seeds/user-seeds';
import { TestApp } from './utils/test-app';


describe('Feature: Cancel a booking', () => {
    let testApp: TestApp
    let app: Application
    let bookingRepository: IBookingRepository

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        await testApp.loadAllFixtures([
            e2eUsers.alice,
            e2eUsers.johnDoe,
            e2eConferences.conference1,
            e2eBookings.aliceBooking
        ])
        app = testApp.expressApp
        bookingRepository = resolveDependency('bookingRepository')
    });

    afterAll(async () => {
        await testApp.tearDown()
    })


    it('should cancel a booking', async () => {

        const conferenceId = e2eConferences.conference1.entity.props.id

        const result = await request(app)
                        .delete(`/conference/book/${conferenceId}`)
                        .set('Authorization', e2eUsers.alice.createJwtToken())
        
        expect(result.status).toBe(200);

        const fetchedBooking = await bookingRepository.findOne(e2eUsers.alice.entity.props.id, conferenceId)

    });
});