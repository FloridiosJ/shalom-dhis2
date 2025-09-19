import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ObjectType()
@Entity('users')
@Unique(['email'])
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Field()
  @Column({ type: 'varchar', length: 64 })
  role!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;
}


