import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PostDto {
    @IsString()
    @ApiProperty({description:'제목', default: 'test'})
    readonly title: string;
    
    @IsString()
    @ApiProperty({description:'내용', default: 'test'})
    readonly text: string;

    @IsString({each : true})
    @ApiProperty({description:'태그', default: '[test, test]'})
    readonly tags: string[];
}