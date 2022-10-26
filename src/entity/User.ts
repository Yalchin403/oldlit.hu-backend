import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Book } from './Book'
import { Review } from './Review'


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number

    @Column()
    isSuperUser: boolean = false

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    isEmailVerified: boolean = false

    @Column()
    dateJoined: Date = new Date()

    @OneToMany(() => Book, (book) => book.user)
    books: Book[]

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[]
}


