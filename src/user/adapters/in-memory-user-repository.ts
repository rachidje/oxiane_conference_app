import { IUserRepository } from "../ports/user-repository.interface";
import { User } from "../user.entity";


export class InMemoryUserRepository implements IUserRepository {
    public database: User[] = []

    async create(user: User): Promise<void> {
        this.database.push(user)
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.database.find(user => user.props.email === email) ?? null
    }

    async findById(id: string): Promise<User | null> {
        return this.database.find(user => user.props.id === id) ?? null
    }
}