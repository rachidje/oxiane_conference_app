import { IsEmail, IsNotEmpty, IsString } from "class-validator"


export class RegisterUserInputs {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}