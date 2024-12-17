import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogService } from 'src/blog/service/blog.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { Repository } from 'typeorm';
import { CreateLikesCounterBlogDto } from '../dto/create-blog-likes.dto';
import { BlogLikesCounterEntity } from '../entities/likes-counter-blog.entity';
import { LikeStatus } from '../enums/like.status.enum';
import { IBlogLikesCounterEntity } from '../interfaces/blog-like-counter.interface';

@Injectable()
export class LikesCounterBlogsService {
  constructor(
    @InjectRepository(BlogLikesCounterEntity)
    private readonly likesCounterBlogRepository: Repository<BlogLikesCounterEntity>,
    @Inject(forwardRef(() => BlogService))
    private readonly blogService: BlogService,
  ) {}

  async createLikeDislikeEntity(
    dto: CreateLikesCounterBlogDto,
    currentUser: IUserEntity,
  ): Promise<IBlogLikesCounterEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogExists = await this.blogService.getBlogById(
      dto.blogId,
      currentUser,
    );
    if (!blogExists) {
      throw new BadRequestException({
        key: 'blogId',
        message: `Blog with id: ${dto.blogId} does not exists`,
      });
    }
    const existingLikeOrDislikeByUser =
      await this.likesCounterBlogRepository.findOneBy({
        blogId: dto.blogId,
        ...(dto.likedStatus === LikeStatus.LIKED
          ? { likedBy: currentUser.id }
          : { disLikedBy: currentUser.id }),
      });
    console.log(
      'this is the existing like or dislike user',
      existingLikeOrDislikeByUser,
    );
    if (!existingLikeOrDislikeByUser) {
      const newLikeDislikeEntity = await this.likesCounterBlogRepository.create(
        {
          blogId: dto.blogId,
          likedStatus: dto.likedStatus,
          likedBy: dto.likedStatus === LikeStatus.LIKED ? currentUser.id : null,
          disLikedBy:
            dto.likedStatus === LikeStatus.DISLIKED ? currentUser.id : null,
          createdBy: currentUser.name,
          updatedBy: currentUser.name,
        },
      );
      const newLikedOrDisLikedEntity =
        await this.likesCounterBlogRepository.save(newLikeDislikeEntity);

      return newLikedOrDisLikedEntity;
    }
    if (existingLikeOrDislikeByUser) {
      if (existingLikeOrDislikeByUser.likedStatus === dto.likedStatus) {
        throw new BadRequestException({
          key: dto.likedStatus === LikeStatus.LIKED ? 'likedBy' : 'disLikedBy',
          message: `Current user has already ${dto.likedStatus.toLowerCase()} this blog`,
        });
      }
    }
  }

  async changeLikeStatusOfBlogById(
    blogId: number,
    currentUser: IUserEntity,
  ): Promise<IBlogLikesCounterEntity> {
    console.log('this is the blog Id from service', blogId);
    console.log('this is the current user from service', currentUser);

    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogExists = await this.blogService.getBlogById(blogId, currentUser);
    console.log('this is the blog exist entity', blogExists);
    if (!blogExists) {
      throw new BadRequestException({
        key: 'blogId',
        message: `Blog with id: ${blogId} does not exists`,
      });
    }
    const existingLikeOrDislikeByUser: IBlogLikesCounterEntity =
      await this.likesCounterBlogRepository.findOneBy({
        blogId: blogId,
      });
    const deleteId = existingLikeOrDislikeByUser.id;
    console.log(
      'this is the existing like or dislike entity',
      existingLikeOrDislikeByUser,
    );
    if (existingLikeOrDislikeByUser) {
      this.likesCounterBlogRepository.delete({
        id: existingLikeOrDislikeByUser.id,
      });
    }
    const likeDislikeEntity = await this.likesCounterBlogRepository.findOneBy({
      id: deleteId,
    });
    return likeDislikeEntity;
  }
}
