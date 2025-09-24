import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => User)
@UseGuards(GqlAuthGuard, RolesGuard) // <-- protège toutes les queries/mutations
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @Roles('admin') // <-- seulement admin peut lister tous les users
  users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  user(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  @Roles('admin') // <-- seulement admin peut créer un user
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    const { email, password, role } = input;
    return this.usersService.create(email, password, role);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  me(@Context() context): User {
    console.log(":>> TEST",context.req.user);
    return context.req.user;
  }
  
}
