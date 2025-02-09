import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IBlogLikesCounterEntity,
  IUserEntity,
  LikeStatus,
} from 'blog-common-1.0';
import { BlogService } from 'src/blog/service/blog.service';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { EntityManager, Like } from 'typeorm';
import { CreateLikesCounterBlogDto } from '../dto/create-blog-likes.dto';
import { BlogLikesCounterEntity } from '../entities/likes-counter-blog.entity';
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

    const existingLikeOrDislikeByUser: IBlogLikesCounterEntity[] =
      await this.likesCounterBlogRepository.getByFilter(
        {
          blogId: dto.blogId,
          createdBy: currentUser.id,
        },
        entityManager,
      );
    // console.log('this is the like/dislike entity', existingLikeOrDislikeByUser);
    if (existingLikeOrDislikeByUser.length > 0) {
      throw new BadRequestException({
        key: `${existingLikeOrDislikeByUser[0].likedStatus === LikeStatus.LIKED ? 'liked' : 'disliked'}`,
        message: `Current user has already ${existingLikeOrDislikeByUser[0].likedStatus === LikeStatus.LIKED ? 'liked' : 'disliked'} this blog`,
      });
    }

    const newLikeDislikeEntityInstance: IBlogLikesCounterEntity =
      await this.likesCounterBlogRepository.getInstance(
        dto,
        currentUser,
        entityManager,
      );
    newLikeDislikeEntityInstance.createdBy =
      newLikeDislikeEntityInstance.updatedBy = currentUser.id;
    let newLikedOrDisLikedEntity = await this.likesCounterBlogRepository.create(
      newLikeDislikeEntityInstance,
      entityManager,
    );
    return newLikedOrDisLikedEntity;
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
          createdBy: currentUser.id,
        },
        entityManager,
      );
    // console.log(
    //   'this is the like dislike entity of the user ',
    //   existingLikeOrDislikeByUser,
    // );
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
    const likeDislikeEntitiesForBlog: IBlogLikesCounterEntity[] =
      await this.likesCounterBlogRepository.getByFilter({ blogId: id });
    return likeDislikeEntitiesForBlog;
  }
}
