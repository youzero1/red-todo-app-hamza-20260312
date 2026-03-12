import 'reflect-metadata';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('todos')
export class Todo {
  @PrimaryColumn('text')
  id!: string;

  @Column('text')
  title!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column('boolean', { default: false })
  completed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
