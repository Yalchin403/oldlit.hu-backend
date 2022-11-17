import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Review } from './Review';
import { Category } from "./Category";
import { ContactInfo } from "./ContactInfo";


@Entity()
export class Book {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;

    @Column({ nullable: false })
    price: number;

    @Column({ default: 0 })
    hitCounter: number;

    @Column({ default: false })
    isActive: boolean;

    @Column({ default: false })
    isPremiumActive: boolean;

    @Column({ default: false })
    isSold: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @OneToOne(() => ContactInfo, { nullable: false })
    @JoinColumn()
    contactInfo: ContactInfo;

    @OneToMany(() => Review, (review) => review.book)
    reviews: Review[];

    @ManyToOne(() => User, (user) => user.books, { nullable: false })
    user: User;

    @ManyToMany(() => Category)
    @JoinTable()
    categories: Category[];
}


