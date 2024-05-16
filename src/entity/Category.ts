import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Base } from "./Base";

@Entity()
export class Category extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;
}
