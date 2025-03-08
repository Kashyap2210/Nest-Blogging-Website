import { BadRequestException, Inject } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

export abstract class BaseTransaction<TransactionInput, TransactionOutput> {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

  //this function will contain all of the operations that you need to perform
  // and has to be implemented in all transaction classes

  protected abstract execute(
    data: TransactionInput,
    manager: EntityManager,
  ): Promise<TransactionOutput>;

  private async createRunner(): Promise<QueryRunner> {
    return this.dataSource.createQueryRunner();
  }

  // this is the main function that will run the transaction
  async run(data: TransactionInput): Promise<TransactionOutput> {
    const queryRunner = await this.createRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.execute(data, queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      console.log('Error during transaction', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error.respones ?? {
          key: 'transaction',
          message: [error.message ?? 'Transaction Failed'],
        },
      );
    } finally {
      await queryRunner.release();
    }
  }

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction i.e. without creating a new Db Transaction

  //   async runWithinTransaction(
  //     data: TransactionInput,
  //     manager: EntityManager,
  //   ): Promise<TransactionOutput> {
  //     return this.execute(data, manager);
  //   }
}
