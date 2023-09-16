import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from '../../products/entities';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('product_tag')
export class ProductTag {
    @PrimaryColumn()
    product_uuid: string;

    @PrimaryColumn()
    tag_uuid: string;

    @ManyToOne(() => Product, (product) => product.tags, {
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
    })
    @JoinColumn({ name: 'product_uuid', referencedColumnName: 'uuid' })
    product: Product[];

    @ManyToOne(() => Tag, (tag) => tag.products, {
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
    })
    @JoinColumn({ name: 'tag_uuid', referencedColumnName: 'uuid' })
    tag: Tag[];
}
