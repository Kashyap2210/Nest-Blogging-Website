import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BlogService } from 'src/blog/service/blog.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager } from 'typeorm';
import { CreateLikesCounterBlogDto } from '../dto/create-blog-likes.dto';
import { BlogLikesCounterEntity } from '../entities/likes-counter-blog.entity';
import { LikeStatus } from '../enums/like.status.enum';
import { IBlogLikesCounterEntity } from '../interfaces/blog-like-counter.interface';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { LikesCounterBlogRepository } from '../repository/likes-counter-blogs.repository';

@Injectable()
export class LikesCounterBlogsService extends EntityManagerBaseService<IBlogLikesCounterEntity> {
  constructor(
    private readonly likesCounterBlogRepository: LikesCounterBlogRepository,
    @Inject(forwardRef(() => BlogService))
    private readonly blogService: BlogService,
  ) {
    super();
  }

  getEntityClass(): new () => IBlogLikesCounterEntity {
    return BlogLikesCounterEntity;
  }

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

    const [existingLikeOrDislikeByUser] =
      await this.likesCounterBlogRepository.getByFilter({
        blogId: dto.blogId,
        ...(dto.likedStatus === LikeStatus.LIKED
          ? { likedBy: currentUser.id }
          : { disLikedBy: currentUser.id }),
      });
    if (!existingLikeOrDislikeByUser) {
      const newLikeDislikeEntity =
        await this.likesCounterBlogRepository.getInstance(
          dto,
          currentUser,
          entityManager,
        );
      newLikeDislikeEntity.createdBy = newLikeDislikeEntity.updatedBy =
        currentUser.id;
      const newLikedOrDisLikedEntity =
        await this.likesCounterBlogRepository.create(
          newLikeDislikeEntity,
          entityManager,
        );

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
  ): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    //Check to see if blog exists
    await this.blogService.checkBlogPresence(blogId, entityManager);

    const [existingLikeOrDislikeByUser]: IBlogLikesCounterEntity[] =
      await this.likesCounterBlogRepository.getByFilter(
        {
          blogId: blogId,
        },
        entityManager,
      );

    if (existingLikeOrDislikeByUser) {
      this.likesCounterBlogRepository.deleteById(
        existingLikeOrDislikeByUser.id,
        entityManager,
      );
    }
  }

  async findLikeDislikeEntitiesByBlogId(
    id: number,
    currentUser: IUserEntity,
  ): Promise<IBlogLikesCounterEntity[]> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const likeDislikeEntitiesForBlog =
      await this.likesCounterBlogRepository.getByFilter({ blogId: id });
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
