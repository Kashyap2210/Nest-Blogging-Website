import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CommentsService } from 'src/comments/service/comments.service';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { DataSource, EntityManager } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogResponse,
  IBlogUpdateDto,
} from '../interfaces/blog.interfaces';
import { BlogRepository } from '../repository/blogs.repository';

@Injectable()
export class BlogService extends EntityManagerBaseService<BlogEntity> {
  constructor(
    // @InjectRepository(BlogRepository)
    private readonly blogRepository: BlogRepository, // Injecting custom repository
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    private readonly likesCounterBlogsService: LikesCounterBlogsService,
    private dataSource: DataSource,
  ) {
    super();
  }
  getEntityClass(): new () => BlogEntity {
    return BlogEntity;
  }

  async createBlog(
    dto: IBlogCreateDto,
    currentUser: IUserEntity,
  ): Promise<IBlogEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blog = await this.blogRepository.getInstance(dto, currentUser);
    return this.blogRepository.create(blog);
  }

  // async getAllBlogs(currentUser: IUserEntity): Promise<IBlogEntityArray> {
  //   if (!currentUser) {
  //     throw new BadRequestException({
  //       key: 'currentUser',
  //       message: 'current user is not logged in',
  //     });
  //   }
  //   return this.blogRepository.getById(id);
  // }

  async getBlogById(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogResponse> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogComments = await this.commentsService.findCommentsByBlogId(id); 
    const [blogById] = await this.blogRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );

    return {
      blog: blogById,
      comments: blogComments,
    };
  }

  async updateBlogById(
    id: number,
    dto: IBlogUpdateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [blogEntityById] = await this.blogRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );
    const blogFromDtoTitle = await this.blogRepository.getByFilter({
      title: [dto.title],
    });
    if (blogFromDtoTitle.length > 0 && blogFromDtoTitle[0].id !== id) {
      throw new BadRequestException({
        key: 'Already exists',
        message: 'Blog with this title already exists',
      });
    }

    if (
      blogEntityById.createdBy !== currentUser.id &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'userId',
        message: `Current User with id ${currentUser.id} is not allowed to update this blog or he is not superAdmin`,
      });
    }

    (blogEntityById.title = dto.title),
      (blogEntityById.content = dto.content),
      (blogEntityById.updatedBy = blogEntityById.createdBy),
      (blogEntityById.keywords = dto.keywords);

    const updatedBlog: IBlogEntity = await this.blogRepository.updateById(id, {
      ...blogEntityById,
      updatedBy: currentUser.id,
    });
    return updatedBlog;
  }

  async deleteBlogById(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [blogToBeDeleted] = await this.blogRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );

    if (
      blogToBeDeleted.createdBy !== currentUser.id &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'userId',
        message: `User with ID ${currentUser.id} is not authorized to delete this blog.`,
      });
    }

    // this are all the affected comments
    const affectedComments =
      await this.commentsService.findCommentsByBlogId(id);
    // console.log("this are all the affected comments", affectedComments)
    const deletedComments = await this.commentsService.cascadeCommentDelete(id);
    // console.log('this is the affected comments deleted', deletedComments);

    //this are all the affected likes & dislikes entity
    const likeDislikeEntitiesToBeDeleted =
      await this.likesCounterBlogsService.findLikeDislikeEntitiesByBlogId(
        id,
        currentUser,
      );
    // console.log(
    //   'this is the affected likes& dislikes entities deleted',
    //   likeDislikeEntitiesToBeDeleted,
    // );
    const affectedEntities =
      await this.likesCounterBlogsService.cascadeDelete(id);
    // console.log('this are all the deleted Entities', affectedEntities);

    //this is to delete the blog
    await this.blogRepository.deleteById(id);
  }

  async getBlogByFilter(currentUser: IUserEntity): Promise<IBlogEntity> {
    const [blogEntity] = await this.blogRepository.getByFilter({
      createdBy: [currentUser.id],
    });
    return blogEntity;
  }

  // async validatePresence(id: number): Promise<IBlogEntity[]> {
  //   const blogExists = await this.blogRepository.findBy({ id });
  //   if (blogExists.length === 0) {
  //     throw new BadRequestException({
  //       key: 'id',
  //       message: `Blog with id:${id} does not exists.`,
  //     });
  //   }
  //   return blogExists;
  // }
}
