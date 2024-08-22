import { Injectable, NotFoundException } from '@nestjs/common';
import { PostModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<PostModel[]> {
    return this.prisma.postModel.findMany();
  }

  async getOne(postId: string): Promise<PostModel> {
    const post = await this.prisma.postModel.findUnique({
      where: {id: +postId}
    });
    if(!post) {
        throw new NotFoundException(`Post with ID: ${postId} not found.`)
    }
    return post;
  }

  async create(postData: PostDto, userId: number): Promise<PostModel> {

    const newPost = await this.prisma.postModel.create({
      data:{
        title: postData.title,
        text: postData.text,
        authorId: userId,
        tags: {
          create: postData.tags.map(t => ({
            tag: {
              connectOrCreate: { where: { tag: t }, create: { tag: t}}
            }   
          }))
        }
      }
    });

    return newPost
  }

  async remove(postId: string) : Promise<boolean> {
    await this.getOne(postId);
    await this.prisma.postModel.delete({
      where: {id: +postId},
    });
    return true;
  }

}
