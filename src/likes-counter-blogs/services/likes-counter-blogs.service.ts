import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogService } from 'src/blog/service/blog.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager, Repository } from 'typeorm';
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
    entityManager?: EntityManager,
  ): Promise<IBlogLikesCounterEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }

    //Check to see if blog exists
    await this.blogService.checkBlogPresence(dto.blogId, entityManager);

    const existingLikeOrDislikeByUser =
      await this.likesCounterBlogRepository.findOneBy({
        blogId: dto.blogId,
        ...(dto.likedStatus === LikeStatus.LIKED
          ? { likedBy: currentUser.id }
          : { disLikedBy: currentUser.id }),
      });

    if (!existingLikeOrDislikeByUser) {
      const newLikeDislikeEntity = await this.likesCounterBlogRepository.create(
        {
          blogId: dto.blogId,
          likedStatus: dto.likedStatus,
          likedBy: dto.likedStatus === LikeStatus.LIKED ? currentUser.id : null,
          disLikedBy:
            dto.likedStatus === LikeStatus.DISLIKED ? currentUser.id : null,
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
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
    entityManager?: EntityManager,
  ): Promise<IBlogLikesCounterEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    await this.blogService.validatePresence(
      'id',
      [blogId],
      'id',
      entityManager,
    );

    const existingLikeOrDislikeByUser: IBlogLikesCounterEntity =
      await this.likesCounterBlogRepository.findOneBy({
        blogId: blogId,
      });
    const deleteId = existingLikeOrDislikeByUser.id;
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

  async findLikeDislikeEntitiesByBlogId(
    id: number,
    currentUser: IUserEntity,
  ): Promise<any> {
    const likeDislikeEntitiesForBlog =
      await this.likesCounterBlogRepository.findBy({ blogId: id });
    return likeDislikeEntitiesForBlog;
  }

  // async cascadeDelete(blogId: number) {
  //   const likeDislikeEntitiesToDelete =
  //     await this.likesCounterBlogRepository.findBy({ blogId });
  //   const likeDislikeEntitiesToDeleteIds = likeDislikeEntitiesToDelete.map(
  //     (entity) => entity.id,
  //   );
  //   return await this.likesCounterBlogRepository.delete(
  //     likeDislikeEntitiesToDeleteIds,
  //   );
  //   // const result = await entityManager
  //   //   .getRepository(this.likesCounterBlogRepository.target)
  //   //   .delete(likeDislikeEntitiesToDeleteIds);
  //   // return result.affected || 0;
  // }
}
