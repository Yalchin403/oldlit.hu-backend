import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Book } from './Book';
import { Review } from './Review';


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    firstName: string;

    @Column({ nullable: false })
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
}