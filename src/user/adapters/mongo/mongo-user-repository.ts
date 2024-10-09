import { Model } from "mongoose";
import { IUserRepository } from "../../ports/user-repository.interface";
import { User } from "../../user.entity";
import { MongoUser } from "./mongo-user";


class UserMapper {
    toCore(user: MongoUser.UserDocument): User {
        return new User({
            id: user._id,
            email: user.email,
            password: user.password
        })
    }

    toPersistence(user: User): MongoUser.UserDocument {
        return new MongoUser.UserModel({
            _id: user.props.id,
            email: user.props.email,
            password: user.props.password
        })
    }
}


export class MongoUserRepository implements IUserRepository {
    private readonly mapper = new UserMapper()

    constructor(private readonly model: Model<MongoUser.UserDocument>) {}

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.model.findOne({email})
        if(!user) return null

        return this.mapper.toCore(user)
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.model.findOne({_id: id})
        if(!user) return null

        return this.mapper.toCore(user)
    }

    async create(user: User): Promise<void> {
        const record = this.mapper.toPersistence(user)
        await record.save()
    }

}