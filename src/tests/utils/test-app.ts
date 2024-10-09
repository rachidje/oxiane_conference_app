import express from 'express'
import mongoose from 'mongoose'
import resolveDependency, { ResolveDependencyFn } from '../../infrastructure/config/dependecy-injection'
import { errorHandlerMiddleware } from '../../infrastructure/middlewares/error-handler.middleware'
import { jsonResponseMiddleware } from '../../infrastructure/middlewares/json-response.middleware'
import conferenceRoutes from '../../infrastructure/routes/conference.routes'
import { IFixture } from './fixture.interface'

export class TestApp {
    private app: express.Application
    private container: ResolveDependencyFn

    constructor() {
        this.app = express()
        this.container = resolveDependency
    }

    async setup() {
        await mongoose.connect('mongodb://admin:qwerty@localhost:3702/conferences?authSource=admin')
        await mongoose.connection.db?.collection('users').deleteMany({})
        await mongoose.connection.db?.collection('conferences').deleteMany({})

        this.app.use(express.json())
        this.app.use(express.urlencoded({extended: true}))
        this.app.use(jsonResponseMiddleware)
        this.app.use(conferenceRoutes)
        this.app.use(errorHandlerMiddleware)
    }

    async loadAllFixtures(fixtures: IFixture[]) {
        return Promise.all(fixtures.map(fixture => fixture.load(this.container)))
    }

    async tearDown() {
        await mongoose.connection.close()
    }

    get expressApp() {
        return this.app
    }

}