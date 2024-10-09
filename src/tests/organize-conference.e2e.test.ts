import amqp from 'amqplib';
import { addDays, addHours } from 'date-fns';
import { Application } from 'express';
import request from 'supertest';
import { e2eUsers } from './seeds/user-seeds';
import { TestApp } from './utils/test-app';


describe('Feature: Organizing Conference', () => {
    let testApp: TestApp
    let app: Application
    let connection: amqp.Connection
    let channel: amqp.Channel

    beforeEach(async () => {
        testApp = new TestApp()
        await testApp.setup()
        await testApp.loadAllFixtures([e2eUsers.johnDoe])
        app = testApp.expressApp

        connection = await amqp.connect('amqp://localhost')
        channel = await connection.createChannel()
        await channel.assertQueue('conference_created', {durable: false})
    });

    afterEach(async () => {
        await channel.close()
        await connection.close()
    })

    afterAll(async () => {
        await testApp.tearDown()
    })

    it('should organize a conference', async () => {
        const result = await request(app)
                            .post('/conference')
                            .set('Authorization', e2eUsers.johnDoe.createJwtToken())
                            .send({
                                title: "My first conference",
                                seats: 100,
                                startDate: addDays(new Date(), 4).toISOString(),
                                endDate: addDays(addHours(new Date(), 2), 4).toISOString(),
                            });
        
        expect(result.status).toBe(201);
        expect(result.body.data).toEqual({ id: expect.any(String) });

        const consumedMessage = await new Promise<any>(resolve => {
            channel.consume('conference_created', (msg) => {
                if(msg !== null) {
                    resolve(JSON.parse(msg.content.toString()))
                    channel.ack(msg)
                }
            })
        })

        expect(consumedMessage).toEqual({
            conferenceId: result.body.data.id,
            organizerEmail: e2eUsers.johnDoe.entity.props.email,
            title: 'My first conference',
            seats: 100
        })
    });
});