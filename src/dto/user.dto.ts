import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
    @IsOptional()
    @IsString()
    @ApiProperty({description:'이름', default: 'Hong Gil-dong'})
    name?: string;

    @IsString()
    @ApiProperty({description:'이메일', default: 'test@gmail.com'})
    email: string;

    @IsString()
    @ApiProperty({description:'비밀번호', default: 'verystrongpassword'})
    password: string;
}