import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Review } from "./Review";
import { Category } from "./Category";
import { Contact } from "./Contact";
import { Base } from "./Base";

@Entity()
export class Book extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ type: "text", array: true, nullable: false })
  images: string[];

  @Column({ nullable: false, type: "float" })
  price: number;

  @Column({ default: 0 })
  hitCounter: number;

  @Column({ select: false, default: false })
  isActive: boolean;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ nullable: true, type: "timestamp" })
  premiumEndsAt: Date;

  @Column({ default: false })
  isSold: boolean;

  @Column({ select: false, default: false })
  isDeleted: boolean;

  @ManyToOne(() => Contact, (contact) => contact.books, {
    nullable: false,
  })
  contact: Contact;

  @OneToMany(() => Review, (review) => review.book)
  reviews: Review[];

  @ManyToOne(() => User, (user) => user.books, { nullable: false })
  user: User;

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];
}
