import { Controller, Get, Post, Delete, Param, Body, UseGuards , Request} from '@nestjs/common';
import { PostService } from './post.service';
import { PostModel } from '@prisma/client'; 
import { PostDto } from '../dto/post.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('게시판 API')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({summary:'전체 게시물', description: '모든 게시물에 관련된 정보를 불러옵니다.'})
  getAll(): Promise<PostModel[]> {
    return this.postService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  @ApiOperation({summary:'게시물 검색', description: '해당 ID의 게시물 정보를 불러옵니다.'})
  @ApiResponse({status:201, description:'게시물을 불러오는데 성공하였습니다.'})
  @ApiResponse({status:404, description:'게시물을 불러오는데 실패하였습니다.'})
  getOne(@Param("id") postId:string): Promise<PostModel> {
    return this.postService.getOne(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({summary:'게시물 추가', description: '게시물을 추가합니다.'})
  @ApiResponse({status:201, description:'게시물을 추가하는데 성공하였습니다.'})
  @ApiResponse({status:404, description:'게시물을 추가하는데 실패하였습니다.'})
  create(@Body() postData: PostDto, @Request() req): Promise<PostModel>{
    const userId = req.user.userId;
    return this.postService.create(postData, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/:id")
  @ApiOperation({summary:'게시물 삭제', description: '게시물을 삭제합니다.'})
  @ApiResponse({status:201, description:'게시물을 삭제하는데 성공하였습니다.'})
  @ApiResponse({status:404, description:'게시물을 삭제하는데 실패하였습니다.'})
  remove(@Param("id") postId:string): Promise<boolean>{
    return this.postService.remove(postId);
  }
}
