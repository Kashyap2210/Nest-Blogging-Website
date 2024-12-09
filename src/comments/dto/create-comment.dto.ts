import { IsOptional, IsString } from "class-validator";
import { ICommentCreateDto } from "../interfaces/comment.create.interface";

export class CreateCommentDto implements ICommentCreateDto{
    
    @IsString()
        
    text: string
} 