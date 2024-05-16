import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaction } from "./Transaction";
import { Base } from "./Base";

@Entity()
export class Package extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  duration: number;

  @OneToMany(() => Transaction, (transaction) => transaction.package)
  transactions: Transaction[];
}
