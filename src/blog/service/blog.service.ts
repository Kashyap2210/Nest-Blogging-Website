import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogEntityArray,
  IBlogResponse,
  IBlogUpdateDto,
  IBulkBlogCreateDto,
} from '../interfaces/blog.interfaces';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

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
    const blog = this.blogRepository.create(dto);
    blog.createdBy = blog.updatedBy = currentUser[0].id;
    blog.author = currentUser[0].name;
    return this.blogRepository.save(blog);
  }

  async createBulkBlog(
    dto: IBulkBlogCreateDto,
    currentUser: IUserEntity,
  ): Promise<IBlogEntityArray> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const bulkBlogs: IBlogEntityArray = [];
    for (const blog of dto) {
      const bulkBlog = await this.blogRepository.save(blog);
      bulkBlogs.push(bulkBlog);
    }
    return bulkBlogs;
  }

  async getAllBlogs(currentUser: IUserEntity): Promise<IBlogEntityArray> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    return this.blogRepository.find();
  }

  async getBlogById(
    id: number,
    currentUser: IUserEntity,
  ): Promise<IBlogResponse> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogComments = await this.commentsService.findCommentsByBlogId(id);
    const blogById = await this.blogRepository.findOneBy({ id });

    return {
      blog: blogById,
      comments: blogComments,
    };
  }

  async updateBlogById(
    id: number,
    dto: IBlogUpdateDto,
    currentUser: IUserEntity,
  ): Promise<IBlogEntity> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogEntityById = await this.blogRepository.findOneBy({ id });
    if (!blogEntityById) {
      throw new BadRequestException({
        key: 'Not Found',
        message: 'Blog with this title does not exist',
      });
    }
    const blogFromDtoTitle = await this.blogRepository.findBy({
      title: dto.title,
    });
    if (blogFromDtoTitle.length > 0 && blogFromDtoTitle[0].id !== id) {
      throw new BadRequestException({
        key: 'Already exists',
        message: 'Blog with this title already exists',
      });
    }
    (blogEntityById.title = dto.title),
      (blogEntityById.content = dto.content),
      (blogEntityById.updatedBy = blogEntityById.createdBy),
      (blogEntityById.keywords = dto.keywords);

    const updatedBlog: IBlogEntity =
      await this.blogRepository.save(blogEntityById);
    return updatedBlog;
  }

  async deleteBlogById(id: number, currentUser: IUserEntity): Promise<void> {
    if (!currentUser) {
      throw new BadRequestException({
        key: 'currentUser',
        message: 'current user is not logged in',
      });
    }
    const blogToBeDeleted = await this.blogRepository.findOneBy({ id });
    this.blogRepository.delete(blogToBeDeleted);
  }
}
