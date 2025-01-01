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

  // async validatePresence<P>(
  //   propertyName: string,
  //   propertyValue: P[],
  //   key?: string,
  //   entityManager?: EntityManager,
  // ): Promise<T[]> {
  //   const repository = this.getRepository(entityManager);
  //   const tableName = repository.metadata.tableName;
  //   let query = repository.createQueryBuilder(tableName);

  //   query = query.andWhere(
  //     `${tableName}.${propertyName} IN (:...${propertyName}){
  //         ${propertyName}:${propertyValue}
  //         }`,
  //   );
  //   // console.log(query, 'this is the query');
  //   const entities = await query.getMany();
  //   // Find missing values
  //   const existingValues = entities.map((entity) => entity[propertyName]);
  //   const missingValues = propertyValue.filter(
  //     (value) => !existingValues.includes(value),
  //   );

  //   // If there are missing values, throw an error
  //   if (missingValues.length > 0) {
  //     throw new BadRequestException({
  //       key: key || propertyName,
  //       message: `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} with ${propertyName} ${missingValues.join(
  //         ', ',
  //       )} not found.`,
  //     });
  //   }
  //   return entities;
  // }

  // async getById<P>(id: number, entityManager?: EntityManager): Promise<T[]> {
  //   const repository = this.getRepository(entityManager);
  //   const tableName = repository.metadata.tableName;
  //   let query = repository.createQueryBuilder(tableName);

  //   query = query.andWhere(`${tableName}.${id} IN (:...${id})`, {
  //     [id]: id,
  //   });
  //   const entity = await query.getMany();
  //   if (entity.length === 0) {
  //     throw new BadRequestException({
  //       key: id,
  //       message: `${tableName.charAt(0).toUpperCase()} entity with ${id} not found`,
  //     });
  //   }
  //   return entity;
  // }

  async validatePresence<P>(
    propertyName: string,
    propertyValues: P[], // Array of values to check
    key?: string,
    entityManager?: EntityManager,
  ): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;

    // Correctly parameterize the query using the IN clause
    const query = repository
      .createQueryBuilder(tableName)
      .andWhere(`${tableName}.${propertyName} IN (:...propertyValues)`, {
        propertyValues, // Array of property values to check
      });

    // Execute the query
    const entities = await query.getMany();

    // Find missing values that don't exist in the entities
    const existingValues = entities.map((entity) => entity[propertyName]);
    const missingValues = propertyValues.filter(
      (value) => !existingValues.includes(value),
    );

    // If there are missing values, throw an error
    if (missingValues.length > 0) {
      throw new BadRequestException({
        key: key || propertyName,
        message: `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} with ${propertyName} ${missingValues.join(
          ', ',
        )} not found.`,
      });
    }

    return entities;
  }

  async deleteById<P>(
    id: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;
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
      const normalizedValue = Array.isArray(value) ? value : [value];
      query = query.andWhere(`${tableName}.${property} IN (:...${property})`, {
        [property]: normalizedValue,
      });
    }

    // Execute the query and fetch the results
    const entities = await query.getMany();
    return entities;
  }

  async deleteMany<P>(
    ids: number[], // Key is the property name, value is the value to
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(entityManager);
    const tableName = repository.metadata.tableName;

    const entities = await repository.delete(ids);
    if (entities.affected === 0) {
      throw new BadRequestException({
        key: ids,
        message: `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} entities with ${ids.join(",")} not found`
      })
    }
  }
}
