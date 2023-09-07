import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('text', {
    nullable: false,
  })
  slug: string;

  @Column('text', {
    nullable: false,
    comment: 'Description of the product',
  })
  description: string;

  @Column('numeric', {
    nullable: false,
    comment: 'Price of the product',
  })
  price: number;

  @Column('enum', {
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  // tags
  // images
}
