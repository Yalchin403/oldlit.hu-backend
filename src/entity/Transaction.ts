import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Package } from "./Package";
import { Base } from "./Base";

@Entity()
export class Transaction extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  status: string;

  @Column({ nullable: false })
  createdAt: Date;

  @Column({ nullable: false })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.transactions, { nullable: false })
  user: User;

  @Column({ nullable: false })
  checkoutSessionID: string;

  @ManyToOne(() => Package, (package_) => package_.transactions, {
    nullable: false,
  })
  package: Package;
}
