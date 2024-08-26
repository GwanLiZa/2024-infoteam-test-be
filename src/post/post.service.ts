import { Injectable, NotFoundException } from '@nestjs/common';
import { PostModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from '../dto/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<PostModel[]> {
    return this.prisma.postModel.findMany({
      include: {
        author: {
          select: {
            id: false,
            name: true,
            email: true,
            createdAt: true,
            password: false
          }
        },
        tags: {
          select: {
            tag: true 
          }
        }
      }
    });
  }

  async searchByKeyword(keyword: string): Promise<PostModel[]> {
    const post = await this.prisma.postModel.findMany({
      where: {
        OR: [
          {
            title: {
              contains: keyword,
              mode: 'insensitive'
            }
          },
          {
            text: {
              contains: keyword,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        author: {
          select: {
            id: false,
            name: true,
            email: true,
            createdAt: true,
            password: false
          }
        },
        tags: {
          select: {
            tag: true 
          }
        }
      }
    });
    return post;
  }

  async searchByTag(tagName: string): Promise<PostModel[]> {
    return this.prisma.postModel.findMany({
      where: {
        tags: {
          some: {
            tag: {
              tag: tagName
            }
          }
        }
      },
      include: {
        author: {
          select: {
            id: false,
            name: true,
            email: true,
            createdAt: true,
            password: false
          }
        },
        tags: {
          select: {
            tag: true 
          }
        }
      }
    });
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
      },
      include: {
        author: {
          select: {
            id: false,
            name: true,
            email: true,
            createdAt: true,
            password: false
          }
        },
        tags: {
          select: {
            tag: true 
          }
        }
      }
    });

    return newPost
  }

  async remove(postId: string) : Promise<boolean> {
    await this.searchByKeyword(postId);
    await this.prisma.postModel.delete({
      where: {id: +postId},
    });
    return true;
  }

}
