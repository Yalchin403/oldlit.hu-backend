import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ContactInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true, default: false })
    isDeliverable: boolean;

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: false })
    fromAddress: string;
}