import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { User } from "./User"
import { Review } from './Review'


@Entity()
export class Book {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    price: number

    @OneToMany(() => Review, (review) => review.book)
    reviews: Review[]

    @ManyToOne(() => User, (user) => user.books)
    user: User
}


