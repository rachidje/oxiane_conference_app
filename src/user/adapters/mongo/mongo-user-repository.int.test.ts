import { Model } from "mongoose"
import { testUsers } from "../../../conference/tests/test-users"
import { TestApp } from "../../../tests/utils/test-app"
import { MongoUser } from "./mongo-user"
import { MongoUserRepository } from "./mongo-user-repository"


describe('MongoUserRepository', () => {
    let app: TestApp
    let model: Model<MongoUser.UserDocument>
    let repository: MongoUserRepository

    beforeEach(async () => {
        app = new TestApp()
        await app.setup()

        model = MongoUser.UserModel
        await model.deleteMany({})
        repository = new MongoUserRepository(model)

        const record = new model({
            _id: testUsers.alice.props.id,
            email: testUsers.alice.props.email,
            password: testUsers.alice.props.password
        })
        await record.save()
    })

    afterEach(async () => {
        await app.tearDown()
    })

    describe('findByEmail', () => {
        it('should find an user by its email', async () => {
            const user = await repository.findByEmail(testUsers.alice.props.email)
            expect(user).toBeDefined()
            expect(user!.props).toEqual(testUsers.alice.props)
        })

        it('should return null if not user found', async () => {
            const user = await repository.findByEmail('unknown@gmail.com')
            expect(user).toBeNull()
        })
    })

    describe('findById', () => {
        it('should find an user by its ID', async () => {
            const user = await repository.findById(testUsers.alice.props.id)
            expect(user).toBeDefined()
            expect(user!.props).toEqual(testUsers.alice.props)
        })

        it('should return null if not user found', async () => {
            const user = await repository.findById('unknown@gmail.com')
            expect(user).toBeNull()
        })
    })

    describe('create', () => {
        it('should create a new user', async () => {
            await repository.create(testUsers.bob)
            const fetchedUser = await model.findOne({_id: testUsers.bob.props.id})

            expect(fetchedUser!.toObject()).toEqual({
                _id: testUsers.bob.props.id,
                email: testUsers.bob.props.email,
                password: testUsers.bob.props.password,
                __v: 0,
            })
        })
    })
})