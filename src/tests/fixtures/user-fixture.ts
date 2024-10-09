import jwt from 'jsonwebtoken';
import { ResolveDependencyFn } from "../../infrastructure/config/dependecy-injection";
import { User } from "../../user/user.entity";
import { IFixture } from "../utils/fixture.interface";


export class UserFixture implements IFixture {
    constructor(public entity: User) {}

    async load(container: ResolveDependencyFn): Promise<void> {
        const repository = container('userRepository')
        await repository.create(this.entity)
    }

    createAuthorizationToken() {
        return `Basic ${Buffer.from(`${this.entity.props.email}:${this.entity.props.password}`).toString('base64')}`
    }

    createJwtToken() {
        const payload = {email: this.entity.props.email}
        return 'Bearer ' + jwt.sign(payload, 'mysecretkey', {expiresIn: '1h'})
    }
}