import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Book } from "./Book";
import { Review } from "./Review";
import { Contact } from "./Contact";
import { Transaction } from "./Transaction";
import { Base } from "./Base";

@Entity()
export class User extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: false })
  password: string;

  @Column({ select: false, nullable: false })
  isSuperUser: boolean;

  @Column()
  dateJoined: Date = new Date();

  @Column({ select: false, nullable: false })
  isEmailVerified: boolean;

  @OneToMany(() => Book, (book) => book.user)
  books: Book[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
