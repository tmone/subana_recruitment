import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './create-location.dto';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}