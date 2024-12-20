import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/service/comments.service';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { Repository } from 'typeorm';
import { BlogEntity } from '../entities/blog.entity';
import {
  IBlogCreateDto,
  IBlogEntity,
  IBlogEntityArray,
  IBlogResponse,
  IBlogUpdateDto
} from '../interfaces/blog.interfaces';
import { IUserEntity } from 'src/users/interfaces/entity.interface';
import { CommentsService } from 'src/comments/services/comments.service';


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
    const [blogById] = await this.validatePresence(id);


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
    const [blogEntityById] = await this.validatePresence(id);
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
    const [blogToBeDeleted] = await this.validatePresence(id);
    this.blogRepository.delete(blogToBeDeleted);
  }

  async validatePresence(id: number): Promise<IBlogEntity[]> {
    const blogExists = await this.blogRepository.findBy({ id });
    if (blogExists.length === 0) {
      throw new BadRequestException({
        key: 'id',
        message: `Blog with id:${id} does not exists.`,
      });
    }
    return blogExists;
    const blogToBeDeleted = await this.validatePresence(id);
    this.blogRepository.delete(blogToBeDeleted);
    }
}
