import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '@src/users/services/users.service';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogEntityArray,
  IBlogLikesCounterEntity,
  IBlogResponse,
  IBlogUpdateDto,
  ICommentEntity,
  IUserEntity,
} from 'blog-common-1.0';
import { CommentsService } from 'src/comments/service/comments.service';
import { EntityManagerBaseService } from 'src/helpers/entity.repository';
import { LikesCounterBlogsService } from 'src/likes-counter-blogs/services/likes-counter-blogs.service';
import { EntityManager } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { BlogRepository } from '../repository/blogs.repository';
import { IEntityFilterData } from 'blog-common-1.0/dist/generi.types';
import { IBlogDeleteData } from '../transactions/interfaces/blog_entity_delete_transaction.interface';
import { BlogDeleteTransaction } from '../transactions/blog_delete_transaction';

@Injectable()
export class BlogService extends EntityManagerBaseService<BlogEntity> {
  constructor(
    private readonly blogRepository: BlogRepository,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly likesCounterBlogsService: LikesCounterBlogsService,
    private readonly blogDeleteTransaction: BlogDeleteTransaction,
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
    const existingBlogs: IBlogEntity[] = await this.blogRepository.getByFilter(
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

    const blog: IBlogEntity = await this.blogRepository.getInstance(
      dto,
      entityManager,
    );
    blog['author'] = currentUser.name;
    blog['createdBy'] = blog['updatedBy'] = currentUser.id;
    return this.blogRepository.create(blog, entityManager);
  }

  async getAllBlogs(
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogResponse[]> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }

    //Commenting out this as we now want all the users to see the list of the blogs
    // if (currentUser.role !== 'TOAA') {
    //   throw new ForbiddenException({
    //     key: 'user.role',
    //     message: 'Current user does not have permission to access all blogs',
    //   });
    // }

    const allBlogs: IBlogEntityArray = await this.blogRepository.getByFilter(
      {},
      entityManager,
    );
    // console.log('this are all the blogs', allBlogs);

    const allLikeAndDislikeEntities =
      await this.likesCounterBlogsService.getByFilter(
        {
          blogId: [allBlogs.map((blog) => blog.id)],
        },
        entityManager,
      );

    const allCommentEntities = await this.commentsService.getByFilter(
      {
        blogId: [allBlogs.map((blog) => blog.id)],
      },
      entityManager,
    );

    let allUsersForResponse: IUserEntity[] = [];
    const allUserIdsFromComments: number[] = allCommentEntities.map(
      (comment) => comment.authorId,
    );
    allUserIdsFromComments.push(
      ...new Set(allBlogs.map((blog) => blog.createdBy)),
    );
    if (allCommentEntities.length > 0) {
      allUsersForResponse = await this.userService.getByFilter(
        {
          id: allUserIdsFromComments,
        },
        entityManager,
      );
    }

    const response: IBlogResponse[] = allBlogs.map((blog) => {
      const likesAndDislikesEntities = allLikeAndDislikeEntities.filter(
        (entity) => entity.blogId === blog.id,
      );

      const commentEntities = allCommentEntities.filter(
        (entity) => entity.blogId === blog.id,
      );

      if (likesAndDislikesEntities) {
        return {
          blog: blog,
          comments: commentEntities ?? [],
          likes: likesAndDislikesEntities ?? [],
          users: allUsersForResponse ?? [],
        };
      }
    });

    return response;
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
    const [blogById]: IBlogEntity[] =
      await this.blogRepository.validatePresence(
        'id',
        [id],
        'id',
        entityManager,
      );
    let blogResponseEntities: {
      blogComments: ICommentEntity[];
      blogLikesAndDislikes: IBlogLikesCounterEntity[];
      usersForResponse: IUserEntity[];
    } = await this.getBlogResponseEntities(
      id,
      currentUser,
      blogById,
      entityManager,
    );

    return {
      blog: blogById,
      comments: blogResponseEntities.blogComments,
      likes: blogResponseEntities.blogLikesAndDislikes,
      users: blogResponseEntities.usersForResponse,
    };
  }

  private async getBlogResponseEntities(
    id: number,
    currentUser: IUserEntity,
    blogById: IBlogEntity,
    entityManager: EntityManager,
  ) {
    const blogComments: ICommentEntity[] =
      await this.commentsService.findCommentsByBlogId([id]);

    const blogLikesAndDislikes =
      await this.likesCounterBlogsService.findLikeDislikeEntitiesByBlogId(
        id,
        currentUser,
      );

    const authorIdsFromCOmments = blogComments.map(
      (comment) => comment.authorId,
    );
    authorIdsFromCOmments.push(blogById.createdBy);

    let usersForResponse: IUserEntity[] = [];
    if (authorIdsFromCOmments.length > 0) {
      usersForResponse = await this.userService.getUserByFilter(
        {
          id: authorIdsFromCOmments,
        },
        entityManager,
      );
    }
    return { blogComments, blogLikesAndDislikes, usersForResponse };
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
    const [blogEntityById]: IBlogEntity[] =
      await this.blogRepository.validatePresence(
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
    const blogFromDtoTitle: IBlogEntity[] =
      await this.blogRepository.getByFilter({
        title: [dto.title],
      });

    if (blogFromDtoTitle.length > 0 && blogFromDtoTitle[0].id !== id) {
      throw new BadRequestException({
        key: 'Already exists',
        message: 'Blog with this title already exists',
      });
    }

    const updatedBlog: IBlogEntity = {
      ...blogEntityById,
      ...dto,
      updatedBy: currentUser.id,
    };
    // console.log('this is the updated blog', updatedBlog);
    const [responseUpdatedBlog]: IBlogEntity[] =
      await this.blogRepository.updateById(id, updatedBlog);
    return responseUpdatedBlog;
  }

  async deleteBlogById(
    id: number,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }

    const [blogToBeDeleted]: IBlogEntity[] =
      await this.blogRepository.validatePresence(
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
    const commentIdsOnBlog: number[] = (
      await this.commentsService.getByFilter(
        {
          blogId: [id],
        },
        entityManager,
      )
    ).map((comments) => comments.id);

    //finding likesAndDislikesEntities on the blog with id:id
    let likeAndDislikeIds: number[] = (
      await this.likesCounterBlogsService.getByFilter(
        {
          blogId: [id],
        },
        entityManager,
      )
    ).map((likesCounterEntity) => likesCounterEntity.id);
    // console.log('this are the like and dislike entities', likeAndDislikeIds);

    const data: IBlogDeleteData = {
      blogId: id,
      commentIds: commentIdsOnBlog,
      likeDislikeEntityIds: likeAndDislikeIds,
    };
    return this.blogDeleteTransaction.executeDeleteTransaction(data);

    // return this.blogRepository.deleteById(id);
  }

  async deleteManyBlogs(ids: number[], entityManager?: EntityManager) {
    return this.blogRepository.deleteMany(ids, entityManager);
  }

  async getBlogsByFilter(
    filter: IEntityFilterData<IBlogEntity>,
    entityManager?: EntityManager,
  ): Promise<any> {
    return this.blogRepository.getByFilter(filter, entityManager);
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
    const [blogEntity]: IBlogEntity[] = await this.blogRepository.getByFilter(
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
    const [blogExists]: IBlogEntity[] =
      await this.blogRepository.validatePresence(
        'id',
        [id],
        'id',
        entityManager,
      );
    return blogExists;
  }

  async updateBlogByKey(
    blogTitle: string,
    dto: IBlogUpdateDto,
    currentUser: IUserEntity,
    entityManager?: EntityManager,
  ): Promise<IBlogEntity> {
    const [blogByTitle] = await this.blogRepository.validatePresence(
      'title',
      [blogTitle],
      'blogTitle',
      entityManager,
    );
    // console.log("this is the blog to be updated", blogByTitle);
    const updatedBlog = await this.updateBlogById(
      blogByTitle.id,
      dto,
      currentUser,
      entityManager,
    );
    // console.log("this is the updated blog", updatedBlog)
    return updatedBlog;
  }
}
