import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate } from "typeorm";

@Entity()
export class Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
