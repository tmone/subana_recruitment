import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock implementation for TypeORM repository
const mockLocationRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(undefined),
  })),
});

describe('LocationService', () => {
  let service: LocationService;
  let repository: jest.Mocked<Repository<Location>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(Location),
          useFactory: mockLocationRepository,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    repository = module.get(getRepositoryToken(Location));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a location without parent successfully', async () => {
      const createDto: CreateLocationDto = {
        name: 'Test Location',
        locationNumber: 'LOC-001',
        area: 100.5,
      };

      const createdLocation: Partial<Location> = {
        id: uuidv4(),
        ...createDto,
        level: 0,
      };

      const savedLocation: Partial<Location> = {
        ...createdLocation,
        path: createdLocation.id,
      };

      repository.create.mockReturnValue(createdLocation as Location);
      repository.save.mockResolvedValueOnce(createdLocation as Location);
      repository.save.mockResolvedValueOnce(savedLocation as Location);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        level: 0,
      });
      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(result.path).toEqual(savedLocation.path);
      expect(result.level).toEqual(0);
    });

    it('should create a location with parent successfully', async () => {
      const parentId = uuidv4();
      const createDto: CreateLocationDto = {
        name: 'Child Location',
        locationNumber: 'LOC-002',
        area: 50.5,
        parentId,
      };

      const parentLocation: Partial<Location> = {
        id: parentId,
        path: parentId,
        level: 0,
      };

      const createdLocation: Partial<Location> = {
        id: uuidv4(),
        ...createDto,
        level: 1, // parent level + 1
      };

      const savedLocation: Partial<Location> = {
        ...createdLocation,
        path: `${parentLocation.path}.${createdLocation.id}`,
      };

      repository.findOne.mockResolvedValue(parentLocation as Location);
      repository.create.mockReturnValue(createdLocation as Location);
      repository.save.mockResolvedValueOnce(createdLocation as Location);
      repository.save.mockResolvedValueOnce(savedLocation as Location);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: parentId } });
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        level: 1,
      });
      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(result.path).toEqual(`${parentLocation.path}.${createdLocation.id}`);
      expect(result.level).toEqual(1);
    });

    it('should throw NotFoundException when parent location not found', async () => {
      const parentId = uuidv4();
      const createDto: CreateLocationDto = {
        name: 'Child Location',
        locationNumber: 'LOC-002',
        area: 50.5,
        parentId,
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Parent location with ID ${parentId} not found`),
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of locations', async () => {
      const locations: Location[] = [
        {
          id: uuidv4(),
          name: 'Test Location 1',
          locationNumber: 'LOC-001',
          area: 100.5,
          parentId: null,
          level: 0,
          path: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
          parent: null,
          children: [],
        },
        {
          id: uuidv4(),
          name: 'Test Location 2',
          locationNumber: 'LOC-002',
          area: 200.5,
          parentId: null,
          level: 0,
          path: '2',
          createdAt: new Date(),
          updatedAt: new Date(),
          parent: null,
          children: [],
        },
      ];

      repository.find.mockResolvedValue(locations);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { path: 'ASC' } });
      expect(result).toEqual(locations);
      expect(result.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a location if found', async () => {
      const id = uuidv4();
      const location: Location = {
        id,
        name: 'Test Location',
        locationNumber: 'LOC-001',
        area: 100.5,
        parentId: null,
        level: 0,
        path: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      repository.findOne.mockResolvedValue(location);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(location);
    });

    it('should throw NotFoundException if location not found', async () => {
      const id = uuidv4();
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(`Location with ID ${id} not found`),
      );
    });
  });

  describe('update', () => {
    it('should update a location successfully', async () => {
      const id = uuidv4();
      const updateDto: UpdateLocationDto = {
        name: 'Updated Location',
        area: 150.5,
      };

      const location: Location = {
        id,
        name: 'Test Location',
        locationNumber: 'LOC-001',
        area: 100.5,
        parentId: null,
        level: 0,
        path: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      const updatedLocation: Location = {
        ...location,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(location);
      repository.save.mockResolvedValue(updatedLocation);

      const result = await service.update(id, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repository.save).toHaveBeenCalledWith({
        ...location,
        ...updateDto,
      });
      expect(result).toEqual(updatedLocation);
    });

    it('should update parent location and adjust level and path', async () => {
      const id = uuidv4();
      const newParentId = uuidv4();
      const updateDto: UpdateLocationDto = {
        parentId: newParentId,
      };

      const location: Location = {
        id,
        name: 'Test Location',
        locationNumber: 'LOC-001',
        area: 100.5,
        parentId: null,
        level: 0,
        path: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      const newParent: Location = {
        id: newParentId,
        name: 'New Parent',
        locationNumber: 'LOC-002',
        area: 200.5,
        parentId: null,
        level: 0,
        path: newParentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      const updatedLocation: Location = {
        ...location,
        parentId: newParentId,
        level: 1, // newParent level + 1
        path: `${newParent.path}.${id}`,
      };

      // Mock for initial location fetch
      repository.findOne.mockResolvedValueOnce(location);
      // Mock for wouldCreateCycle check
      repository.findOne.mockResolvedValueOnce(null);
      // Mock for new parent
      repository.findOne.mockResolvedValueOnce(newParent);
      // Final save
      repository.save.mockResolvedValue(updatedLocation);

      const result = await service.update(id, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedLocation);
    });

    it('should throw NotFoundException if location not found', async () => {
      const id = uuidv4();
      const updateDto: UpdateLocationDto = {
        name: 'Updated Location',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        new NotFoundException(`Location with ID ${id} not found`),
      );
    });
  });

  describe('remove', () => {
    it('should remove a location successfully if it has no children', async () => {
      const id = uuidv4();
      const location: Location = {
        id,
        name: 'Test Location',
        locationNumber: 'LOC-001',
        area: 100.5,
        parentId: null,
        level: 0,
        path: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      repository.findOne.mockResolvedValue(location);
      repository.find.mockResolvedValue([]);
      repository.remove.mockResolvedValue(location);

      await service.remove(id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repository.find).toHaveBeenCalledWith({ where: { parentId: id } });
      expect(repository.remove).toHaveBeenCalledWith(location);
    });

    it('should throw an error if location has children', async () => {
      const id = uuidv4();
      const location: Location = {
        id,
        name: 'Test Location',
        locationNumber: 'LOC-001',
        area: 100.5,
        parentId: null,
        level: 0,
        path: id,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      const childLocation: Location = {
        id: uuidv4(),
        name: 'Child Location',
        locationNumber: 'LOC-002',
        area: 50.5,
        parentId: id,
        level: 1,
        path: `${id}.${uuidv4()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: location,
        children: [],
      };

      repository.findOne.mockResolvedValue(location);
      repository.find.mockResolvedValue([childLocation]);

      await expect(service.remove(id)).rejects.toThrow(
        'Cannot delete a location that has children',
      );
    });

    it('should throw NotFoundException if location not found', async () => {
      const id = uuidv4();
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Location with ID ${id} not found`),
      );
    });
  });

  describe('getTree', () => {
    it('should return a hierarchical tree of locations', async () => {
      const rootId = uuidv4();
      const childId = uuidv4();
      
      const rootLocation: Location = {
        id: rootId,
        name: 'Root Location',
        locationNumber: 'LOC-001',
        area: 100.5,
        parentId: null,
        level: 0,
        path: rootId,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      const childLocation: Location = {
        id: childId,
        name: 'Child Location',
        locationNumber: 'LOC-002',
        area: 50.5,
        parentId: rootId,
        level: 1,
        path: `${rootId}.${childId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };

      // Mock root locations
      repository.find.mockResolvedValueOnce([rootLocation]);
      // Mock children for root
      repository.find.mockResolvedValueOnce([childLocation]);
      // Mock children for child (none)
      repository.find.mockResolvedValueOnce([]);

      const result = await service.getTree();

      expect(repository.find).toHaveBeenCalledTimes(3);
      expect(result).toEqual([
        {
          ...rootLocation,
          children: [{ ...childLocation, children: [] }],
        },
      ]);
    });
  });
    describe('Full location hierarchy test', () => {
    it('should create and validate a full location hierarchy', async () => {
      // Create building (root level)
      const building: { id: string; name: string; locationNumber: string; area: number; parentId: string | null; level: number; path: string | null; createdAt: Date; updatedAt: Date; parent: null; children: any[] } = {
        id: uuidv4(),
        name: 'Building A',
        locationNumber: 'A',
        area: 1000,
        parentId: null,
        level: 0,
        path: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };
  
      // Create floor (level 1)
      const floor: { id: string; name: string; locationNumber: string; area: number; parentId: string | null; level: number; path: string | null; createdAt: Date; updatedAt: Date; parent: null; children: any[] } = {
        id: uuidv4(),
        name: 'First Floor',
        locationNumber: 'A-1',
        area: 500,
        parentId: building.id,
        level: 1,
        path: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };
  
      // Create room (level 2)
      const room: { id: string; name: string; locationNumber: string; area: number; parentId: string | null; level: number; path: string | null; createdAt: Date; updatedAt: Date; parent: null; children: any[] } = {
        id: uuidv4(),
        name: 'Conference Room',
        locationNumber: 'A-1-101',
        area: 50,
        parentId: floor.id,
        level: 2,
        path: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        parent: null,
        children: [],
      };
  
      // Setup path properties after IDs are created
      building.path = building.id;
      floor.path = `${building.id}.${floor.id}`;
      room.path = `${building.id}.${floor.id}.${room.id}`;
  
      // Mock repository behavior
      repository.findOne.mockImplementation((options) => {
        const { where } = options;
        if (!Array.isArray(where) && where?.id === building.id) return Promise.resolve(building as Location);
        if (!Array.isArray(where) && where?.id === floor.id) return Promise.resolve(floor as Location);
        if (!Array.isArray(where) && where?.id === room.id) return Promise.resolve(room as Location);
        return Promise.resolve(null);
      });
  
      repository.find.mockImplementation((options) => {
        if (!options || !options.where) {
          return Promise.resolve([building, floor, room] as Location[]);
        }
        
        const { where } = options;
        if (!Array.isArray(where) && where?.parentId === null) return Promise.resolve([building] as Location[]);
        if (!Array.isArray(where) && where?.parentId === building.id) return Promise.resolve([floor] as Location[]);
        if (!Array.isArray(where) && where?.parentId === floor.id) return Promise.resolve([room] as Location[]);
        return Promise.resolve([]);
      });
  
      // Test findOne for each level
      expect(await service.findOne(building.id)).toEqual(building);
      expect(await service.findOne(floor.id)).toEqual(floor);
      expect(await service.findOne(room.id)).toEqual(room);
  
      // Test getTree function (should return full hierarchy)
      const tree = await service.getTree();
      expect(tree).toEqual([
        {
          ...building,
          children: [
            {
              ...floor,
              children: [
                {
                  ...room,
                  children: []
                }
              ]
            }
          ]
        }
      ]);
  
      // Test findChildren function for building
      repository.find.mockResolvedValueOnce([floor] as Location[]);
      const buildingChildren = await service.findChildren(building.id);
      expect(buildingChildren).toEqual([floor]);
  
      // Test path consistency across levels
      expect(building.path).toBe(building.id);
      expect(floor.path).toBe(`${building.id}.${floor.id}`);
      expect(room.path).toBe(`${building.id}.${floor.id}.${room.id}`);
      
      // Test level consistency across hierarchy
      expect(building.level).toBe(0);
      expect(floor.level).toBe(1);
      expect(room.level).toBe(2);
    });
  });
});