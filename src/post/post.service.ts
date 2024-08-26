import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async remove(postId: string, userId: number): Promise<boolean> {
    const post = await this.prisma.postModel.findUnique({
      where: { id: +postId },
      select: { authorId: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID: ${postId} not found.`);
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this post.');
    }
    await this.prisma.tagsOnPosts.deleteMany({
      where: { postId: +postId }
    });
    await this.prisma.postModel.delete({
      where: {id: +postId},
    });
    return true;
  }

  async update(postId: string, userId: number, postData: PostDto): Promise<PostModel> {
    const post = await this.prisma.postModel.findUnique({
      where: { id: +postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID: ${postId} not found.`);
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not authorized to update this post.');
    }

    const searchTagId = await Promise.all(
      postData.tags.map(async (t) => {
        const tag = await this.prisma.tag.findUnique({
          where: { tag: t },
        });
        return tag ? tag.id : null;
      }),
    );
    
    const tagUpserts = postData.tags.map((t) => ({
      where: {
        tagId_postId: {
          tagId: searchTagId.find(id => id !== null),
          postId: +postId
        }
      },
      update: {
        tag: { connectOrCreate: { where: { tag: t }, create: { tag: t } } },
      },
      create: {
        tag: { connectOrCreate: { where: { tag: t }, create: { tag: t } } },
      },
    }));

    const updatedPost = await this.prisma.postModel.update({
      where: { id: +postId },
      data: {
        title: postData.title,
        text: postData.text,
        tags: {
          upsert: tagUpserts
        },
      },
      include: {
        author: {
          select: {
            id: false,
            name: true,
            email: true,
            createdAt: true,
            password: false,
          },
        },
        tags: {
          select: {
            tag: true,
          },
        },
      },
    });

    return updatedPost;
  }
}
