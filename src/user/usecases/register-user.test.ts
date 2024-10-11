import { FixedIDGenerator } from "../../core/adapters/fixed-id-generator"
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer"
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository"
import { RegisterUser } from "./register-user"


describe('register user', () => {
    let usecase: RegisterUser
    let idGenerator: FixedIDGenerator
    let userRepository: InMemoryUserRepository
    let mailer: InMemoryMailer

    beforeEach(() => {
        idGenerator = new FixedIDGenerator()
        userRepository = new InMemoryUserRepository()
        mailer = new InMemoryMailer()
        usecase = new RegisterUser(idGenerator, userRepository, mailer)
    })

    describe('Scenario: Happy path', () => {
        const payload = {
            email: 'johndoe@gmail.com',
            password: 'qwerty'
        }
        it('should register a user', async () => {
            const result = await usecase.execute(payload)
            expect(result.id).toEqual('id-1')

            const fetchedUser = await userRepository.findByEmail(payload.email)
            expect(fetchedUser).toBeDefined()
            expect(fetchedUser!.props.email).toEqual(payload.email)
            expect(fetchedUser!.props.password).toEqual(payload.password)
        })
        it('should send a welcome email', async () => {
            await usecase.execute(payload)
            expect(mailer.sentEmails).toHaveLength(1)
            expect(mailer.sentEmails[0]).toEqual({
                from: 'TEDx Conference',
                to: payload.email,
                subject: 'Welcome to TEDx Conference',
                body: `Welcome to TEDx Conference, your account has been created successfully !`
            })

        })
    })
})