import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Book } from './Book';

@Entity()
export class Review {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    stars: number;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Book, (book) => book.reviews, { nullable: false })
    book: Book;

    @ManyToOne(() => User, (user) => user.reviews, { nullable: false })
    user: User;
}


