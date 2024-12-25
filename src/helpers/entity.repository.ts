import { BadRequestException, Inject } from '@nestjs/common';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

export abstract class EntityManagerBaseService<T> {
  @Inject(EntityManager)
  protected readonly globalEntityManager: EntityManager;
  getEntityManager(entityManager: EntityManager): EntityManager {
    return entityManager ?? this.globalEntityManager;
  }

  abstract getEntityClass(): new () => T;

  getRepository(entityManager?: EntityManager): Repository<T> {
    const effectiveEntityManager = this.getEntityManager(entityManager);
    return effectiveEntityManager.getRepository(this.getEntityClass());
  }

  getQueryBuilder(entityManager: EntityManager): SelectQueryBuilder<T> {
    const repository = this.getRepository(entityManager);
    return repository.createQueryBuilder(repository.metadata.tableName);
  }

  async validatePresence<P>(
    propertyName: string,
    propertyValue: P[],
    key?: string,
    entityManager?: EntityManager,
  ): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;
    let query = repository.createQueryBuilder(tableName);

    query = query.andWhere(
      `${tableName}.${propertyName} IN (:...${propertyName}){
          [propertyName]:propertyValue
          }`,
    );
    const entities = await query.getMany();
    const propertyValuesFromEntities = entities.map(
      (entity) => entity[propertyName],
    );
    const includes = propertyValuesFromEntities.includes(propertyValue);
    const missingValues = entities.filter(
      (entity) => !propertyValue.includes(entity[propertyName as keyof T] as P),
    );

    if (!includes) {
      throw new BadRequestException({
        key: key || 'id',
        message: `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} with ${propertyName} ${missingValues.join(',')} not found`,
      });
    }
    return entities;
  }

  async getById<P>(id: number, entityManager?: EntityManager): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;
    let query = repository.createQueryBuilder(tableName);

    query = query.andWhere(`${tableName}.${id} IN (:...${id})`, {
      [id]: id,
    });
    const entity = await query.getMany();
    if (entity.length === 0) {
      throw new BadRequestException({
        key: id,
        message: `${tableName.charAt(0).toUpperCase()} entity with ${id} not found`,
      });
    }
    return entity;
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;
    let query = repository.createQueryBuilder(tableName);

    query = query.andWhere(`${tableName}.${id} IN (:...${id})`, {
      [id]: id,
    });
    const entity = await repository.delete(id);
    if (entity.affected === 0) {
      throw new BadRequestException({
        key: id,
        message: `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} entity with ${id} not found`,
      });
    }
    // return entity;
  }

  async getByFilter(
    filter: Record<string, any>, // Key is the property name, value is the value to filter by
    entityManager?: EntityManager,
  ): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;

    // Initialize the query builder
    let query = repository.createQueryBuilder(tableName);

    // Loop through the filter object to dynamically build the query
    for (const [property, value] of Object.entries(filter)) {
      // Use the `where` condition for each property dynamically
      query = query.andWhere(`${tableName}.${property} IN (:...${property})`, {
        [property]: value,
      });
    }

    // Execute the query and fetch the results
    const entities = await query.getMany();

    // If no entities are found, throw a BadRequestException
    if (entities.length === 0) {
      throw new BadRequestException({
        key: Object.keys(filter).join(', '),
        message: `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} with ${JSON.stringify(
          filter,
        )} not found`,
      });
    }

    return entities;
  }
}
