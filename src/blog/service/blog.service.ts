import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CommentsService } from 'src/comments/service/comments.service';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
// import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { EntityManager } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogEntityArray,
  IBlogResponse,
  IBlogUpdateDto,
} from '../interfaces/blog.interfaces';
import { BlogRepository } from '../repository/blogs.repository';
import { IUserEntity } from 'blog-common-1.0';

@Injectable()
export class BlogService extends EntityManagerBaseService<BlogEntity> {
  constructor(
    private readonly blogRepository: BlogRepository, // Injecting custom repository
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    private readonly likesCounterBlogsService: LikesCounterBlogsService,
    // private dataSource: DataSource,
  ) {
    super();
  }
  getEntityClass(): new () => BlogEntity {
    return BlogEntity;
  }

  async createBlog(
    dto: IBlogCreateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }

    //Check if blog with same title exists
    const existingBlogs = await this.blogRepository.getByFilter(
      {
        title: [dto.title],
      },
      entityManager,
    );
    if (existingBlogs.length > 0) {
      throw new BadRequestException({
        key: 'title',
        message: 'Blog with this title already exists',
      });
    }

    const blog = await this.blogRepository.getInstance(dto, entityManager);
    blog['author'] = currentUser.name;
    blog['createdBy'] = blog['updatedBy'] = currentUser.id;
    return this.blogRepository.create(blog, entityManager);
  }

  async getAllBlogs(
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntityArray> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    if (currentUser.role !== 'TOAA') {
      throw new ForbiddenException({
        key: 'user.role',
        message: 'Current user does not have permission to access all blogs',
      });
    }
    const allBlogs = await this.blogRepository.getByFilter({}, entityManager);
    return allBlogs;
  }

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
    const [blogById] = await this.blogRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );
    const blogComments = await this.commentsService.findCommentsByBlogId([id]);

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
    if (
      currentUser.id !== blogEntityById.createdBy &&
      currentUser.role !== 'TOAA'
    ) {
      throw new BadRequestException({
        key: 'id | role',
        message:
          'current user did not create this blog or does not have permission to update this blog',
      });
    }
    const blogFromDtoTitle = await this.blogRepository.getByFilter({
      title: [dto.title],
    });
    if (blogFromDtoTitle.length > 0 && blogFromDtoTitle[0].id !== id) {
      throw new BadRequestException({
        key: 'Already exists',
        message: 'Blog with this title already exists',
      });
    }

    const updatedBlog = {
      ...blogEntityById,
      ...dto,
      updatedBy: currentUser.id,
    };

    const responseUpdatedBlog: IBlogEntity =
      await this.blogRepository.updateById(id, updatedBlog);
    return responseUpdatedBlog;
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
        key: 'user.id',
        message: 'Current user cannot delete this blog',
      });
    }

    //finding comments on the blog with id:id
    const commentIdsOnBlog = (
      await this.commentsService.getByFilter(
        {
          blogId: [id],
        },
        entityManager,
      )
    ).map((comments) => comments.id);
    // console.log('this are the comments on the blog', commentIdsOnBlog);
    if (commentIdsOnBlog.length > 0) {
      await this.commentsService.deleteMany(commentIdsOnBlog, entityManager);
    }

    //finding likesAndDislikesEntities on the blog with id:id
    let likeAndDislikeIds = (
      await this.likesCounterBlogsService.getByFilter(
        {
          blogId: [id],
        },
        entityManager,
      )
    ).map((likesCounterEntity) => likesCounterEntity.id);
    // console.log('this are the like and dislike entities', likeAndDislikeIds);
    if (likeAndDislikeIds.length > 0) {
      await this.likesCounterBlogsService.deleteMany(
        likeAndDislikeIds,
        entityManager,
      );
    }
    await this.blogRepository.deleteById(id);
  }

  async getBlogUserIdFilter(
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const [blogEntity] = await this.blogRepository.getByFilter(
      {
        createdBy: [currentUser.id],
      },
      entityManager,
    );
    return blogEntity;
  }

  async checkBlogPresence(
    id: number,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    const [blogExists] = await this.blogRepository.validatePresence(
      'id',
      [id],
      'id',
      entityManager,
    );
    return blogExists;
  }
}
