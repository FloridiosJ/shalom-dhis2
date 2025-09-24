import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of users',
    type: CreateUserDto,
    isArray: true
  })
  findAll() {
    return [
      {
        email: 'user1@example.com',
        role: 'USER'
      },
      {
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    ];
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'The user has been successfully created.',
    type: CreateUserDto
  })
  create(@Body() createUserDto: CreateUserDto) {
    return {
      id: 'generated-uuid',
      ...createUserDto,
      createdAt: new Date().toISOString()
    };
  }
}