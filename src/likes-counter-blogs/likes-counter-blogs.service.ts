import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateLikesCounterBlogDto } from './dto/create-blog-likes.dto';
import { UpdateLikesCounterBlogDto } from './dto/update-likes-counter-blog.dto';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { LikeStatus } from './enums/like.status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogLikesCounterEntity } from './entities/likes-counter-blog.entity';
import { Repository } from 'typeorm';
import { BlogService } from 'src/blog/service/blog.service';

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
  ): Promise<any> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
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

  findAll() {
    return `This action returns all likesCounterBlogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} likesCounterBlog`;
  }

  update(id: number, updateLikesCounterBlogDto: UpdateLikesCounterBlogDto) {
    return `This action updates a #${id} likesCounterBlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} likesCounterBlog`;
  }
}
