import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IBlogResponse } from 'blog-common-1.0';
import { Cache } from 'cache-manager';
import { BlogService } from './blog.service';

@Injectable()
export class BlogCacheService {
  private readonly cacheKey = process.env.CACHE_KEY;
  constructor(
    @Inject(CACHE_MANAGER)
    private blogCacheService: Cache,
    // @Inject(forwardRef(() => BlogService))
    // private readonly blogService: BlogService,
  ) {}

  async setAllBlogsInCash(list: IBlogResponse[]): Promise<IBlogResponse[]> {
    return this.blogCacheService.set(this.cacheKey, list);
  }

  async getAllBlogsCached(): Promise<IBlogResponse[]> {
    const cachedBlogs = await this.blogCacheService.get<IBlogResponse[]>(
      this.cacheKey,
    );

    if (cachedBlogs && cachedBlogs.length > 0) {
      return cachedBlogs;
    }
  }
}
