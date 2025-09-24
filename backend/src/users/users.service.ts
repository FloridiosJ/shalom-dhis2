import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, password: string, role: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashedPassword, role });
    return this.usersRepository.save(user);
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (attrs.password) {
      attrs.password = await bcrypt.hash(attrs.password, 10);
    }
    Object.assign(user, attrs);
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`User #${id} not found`);
  }

  async seedAdmin() {
  const existingAdmin = await this.usersRepository.findOne({ where: { email: 'admin@shalom.local' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = this.usersRepository.create({
      email: 'admin@shalom.local',
      password: hashedPassword,
      role: 'admin',
    });
    await this.usersRepository.save(admin);
    console.log('✅ Admin par défaut créé: admin@shalom.local / Admin123!');
  } else {
    console.log('ℹ️ Admin déjà existant, aucun seed nécessaire');
  }
}

}
