import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LocationService } from '../services/location.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { Location } from '../entities/location.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('locations')
@Controller('api/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'The location has been successfully created.', type: Location })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @Post()
  create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationService.create(createLocationDto);
  }

  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'List of all locations.', type: [Location] })
  @Get()
  findAll(): Promise<Location[]> {
    return this.locationService.findAll();
  }

  @ApiOperation({ summary: 'Get hierarchical tree of all locations' })
  @ApiResponse({ status: 200, description: 'Hierarchical tree of locations.', type: [Location] })
  @Get('tree')
  getTree(): Promise<Location[]> {
    return this.locationService.getTree();
  }

  @ApiOperation({ summary: 'Get children of a specific location' })
  @ApiParam({ name: 'id', description: 'ID of the parent location' })
  @ApiResponse({ status: 200, description: 'Children locations found.', type: [Location] })
  @ApiResponse({ status: 404, description: 'Parent location not found.' })
  @Get('children/:id')
  getChildren(@Param('id') id: string): Promise<Location[]> {
    return this.locationService.getChildren(id);
  }

  @ApiOperation({ summary: 'Get a specific location by ID' })
  @ApiParam({ name: 'id', description: 'ID of the location to find' })
  @ApiResponse({ status: 200, description: 'Location found.', type: Location })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Location> {
    return this.locationService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', description: 'ID of the location to update' })
  @ApiResponse({ status: 200, description: 'Location updated successfully.', type: Location })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto): Promise<Location> {
    return this.locationService.update(id, updateLocationDto);
  }

  @ApiOperation({ summary: 'Delete a location' })
  @ApiParam({ name: 'id', description: 'ID of the location to delete' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.locationService.remove(id);
  }
}