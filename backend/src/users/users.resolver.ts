import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  async findOne(@Args('id', { type: () => ID }) id: number): Promise<User> {
    return this.usersService.findOne(Number(id));
  }

  @Mutation(() => User)
  async createUser(
    @Args('email') email: string,
    @Args('role') role: string,
    @Args('password') password: string,
  ): Promise<User> {
    return this.usersService.create({ email, role, password });
  }
}


