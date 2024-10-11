import { IIDGenerator } from "../../core/ports/id-generator.interface"
import { IMailer } from "../../core/ports/mailer.interface"
import { IExecutable } from "../../shared/executable.interface"
import { IUserRepository } from "../ports/user-repository.interface"
import { User } from "../user.entity"


type RegisterUserRequest = {
    email: string
    password: string
}

type RegisterUserResponse = {
    id: string
}

export class RegisterUser implements IExecutable<RegisterUserRequest, RegisterUserResponse> {
    constructor(
        private readonly idGenerator: IIDGenerator,
        private readonly userRepository: IUserRepository,
        private readonly mailer: IMailer
    ) {}

    async execute({email, password}: RegisterUserRequest): Promise<RegisterUserResponse> {
        const id = this.idGenerator.generate()
        const user = new User({
                id,
                email,
                password 
            })

        await this.userRepository.create(user)
        await this.sendWelcomeEmail(email)

        return {id}
    }

    private async sendWelcomeEmail(email: string) {
        await this.mailer.send({
            from: 'TEDx Conference',
            to: email,
            subject: 'Welcome to TEDx Conference',
            body: `Welcome to TEDx Conference, your account has been created successfully !`
        })
    }
}