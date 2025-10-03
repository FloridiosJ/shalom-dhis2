import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { UserType } from '../types/user';
import User from '../../models/user';

@Resolver(UserType)
export class UserResolver {
  @Query(() => [UserType])
  async users(): Promise<User[]> {
    return await User.findAll();
  }

  @Query({ returns: () => UserType, nullable: true })
  async user(@Arg('id') id: string): Promise<User | null> {
    return await User.findByPk(id);
  }
}