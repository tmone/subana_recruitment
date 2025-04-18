import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ description: 'Name of the location' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique location identifier number' })
  @IsString()
  locationNumber: string;

  @ApiProperty({ description: 'Area size of the location' })
  @IsNumber()
  area: number;

  @ApiPropertyOptional({ description: 'UUID of the parent location' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}