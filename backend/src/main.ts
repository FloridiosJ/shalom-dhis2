import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Appel du seed admin
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();
  await app.listen(3000);
  console.log(`🚀 Server running at http://localhost:3000/graphql`);
}
bootstrap();
