import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Book } from "./Book";
import { User } from "./User";
import { Base } from "./Base";

@Entity()
export class Contact extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, default: false })
  isDeliverable: boolean;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: false })
  fromAddress: string;

  @OneToMany(() => Book, (book) => book.contact)
  books: Book[];

  @ManyToOne(() => User, (user) => user.contacts, { nullable: false })
  user: User;
}
