import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    uuid: number;

    @Column('text', {
        nullable: false,
    })
    url: string;

    @ManyToOne(() => Product, (product) => product.images, {
        onDelete: 'CASCADE',
    })
    product: Product;
}
