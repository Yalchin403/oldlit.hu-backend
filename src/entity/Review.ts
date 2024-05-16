import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Book } from "./Book";
import { Base } from "./Base";

@Entity()
export class Review extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  stars: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Book, (book) => book.reviews, { nullable: false })
  book: Book;

  @Column({ nullable: false, default: true })
  isVerified: boolean;

  @ManyToOne(() => User, (user) => user.reviews, { nullable: false })
  user: User;
}
