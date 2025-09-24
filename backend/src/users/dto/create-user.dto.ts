import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The user password',
  })
  password: string;

  @ApiProperty({
    example: 'USER',
    description: 'The user role',
    enum: ['ADMIN', 'USER'],
  })
  role: string;
}