import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogEntityArray,
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

@Injectable()
export class BlogService extends EntityManagerBaseService<BlogEntity> {
  constructor(
    private readonly blogRepository: BlogRepository,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    private readonly likesCounterBlogsService: LikesCounterBlogsService,
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
        };
      }
    });

    // console.log('this is the response', response);

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
    const blogComments: ICommentEntity[] =
      await this.commentsService.findCommentsByBlogId([id]);

    const blogLikesAndDislikes =
      await this.likesCounterBlogsService.findLikeDislikeEntitiesByBlogId(
        id,
        currentUser,
      );
    return {
      blog: blogById,
      comments: blogComments,
      likes: blogLikesAndDislikes,
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
    console.log('this is the updated blog', updatedBlog);
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
    // console.log('this are the comments on the blog', commentIdsOnBlog);
    if (commentIdsOnBlog.length > 0) {
      await this.commentsService.deleteMany(commentIdsOnBlog, entityManager);
    }

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
    if (likeAndDislikeIds.length > 0) {
      await this.likesCounterBlogsService.deleteMany(
        likeAndDislikeIds,
        entityManager,
      );
    }
    return this.blogRepository.deleteById(id);
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
