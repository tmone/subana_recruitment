import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('locations')
export class Location {
  @ApiProperty({ description: 'Unique identifier', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the location', example: 'Warehouse A' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Unique location number', example: 'LOC-001' })
  @Column({ length: 100, name: 'location_number' })
  locationNumber: string;

  @ApiProperty({ description: 'Area size of the location', example: 1500.75 })
  @Column('decimal', { precision: 10, scale: 2 })
  area: number;

  @ApiProperty({ description: 'ID of the parent location', example: '123e4567-e89b-12d3-a456-426614174001', nullable: true })
  @Column({ name: 'parent_id', nullable: true })
  parentId: string | null;

  @ApiProperty({ description: 'Hierarchy level of the location', example: 2 })
  @Column({ default: 0 })
  level: number;

  @ApiProperty({ description: 'Path representing location hierarchy', example: '1.5.12' })
  @Column({ length: 1000 })
  path: string;

  @ApiProperty({ description: 'Timestamp of when the record was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of when the record was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Parent location object', type: () => Location })
  @ManyToOne(() => Location, location => location.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Location | null;

  @ApiProperty({ description: 'Child location objects', type: () => [Location] })
  @OneToMany(() => Location, location => location.parent)
  children: Location[];
}