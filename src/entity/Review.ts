import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./User"
import { Book } from './Book'

@Entity()
export class Review {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    stars: number

    @Column()
    description: string

    @ManyToOne(() => Book, (book) => book.reviews)
    book: Book

    @ManyToOne(() => User, (user) => user.reviews)
    user: User
}


