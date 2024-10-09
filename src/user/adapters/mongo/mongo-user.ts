import mongoose, { Document, Schema } from "mongoose";


export namespace MongoUser {
    export const CollectioName = 'users'

    export interface UserDocument extends Document {
        _id: string;
        email: string;
        password: string
    }

    export const UserSchema = new Schema<UserDocument>({
        _id: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true}
    })

    export const UserModel = mongoose.model<UserDocument>(CollectioName, UserSchema)
}