import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationModule } from '../src/modules/location/location.module';
import { Location } from '../src/modules/location/entities/location.entity';
import { UpdateLocationDto } from '../src/modules/location/dto/update-location.dto';

describe('LocationController (Integration)', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    // Create mock repository with minimal implementation focused on parent update test
    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      })),
    };

    // Setup the parent1 location
    const parent1Id = '30edc3d0-64a8-428f-a77e-b44cb148f9bb';
    const parent1 = {
      id: parent1Id,
      name: 'Parent 1',
      locationNumber: 'LOC-PARENT-1',
      area: 500,
      parentId: null,
      level: 0,
      path: parent1Id
    };

    // Setup the parent2 location
    const parent2Id = '5b7e87b2-4daf-46c2-b3a5-a1e1986872b0';
    const parent2 = {
      id: parent2Id,
      name: 'Parent 2',
      locationNumber: 'LOC-PARENT-2',
      area: 600,
      parentId: null,
      level: 0,
      path: parent2Id
    };

    // Setup the child location
    const childId = 'c7723614-325f-4142-a8c9-b020af25e49b';
    const child = {
      id: childId,
      name: 'Child to Move',
      locationNumber: 'LOC-CHILD-MOVE',
      area: 250,
      parentId: parent1Id,
      level: 1,
      path: `${parent1Id}.${childId}`
    };

    // Mock the findOne method to return appropriate objects
    mockRepository.findOne.mockImplementation(({ where }) => {
      if (where.id === parent1Id) return Promise.resolve(parent1);
      if (where.id === parent2Id) return Promise.resolve(parent2);
      if (where.id === childId) return Promise.resolve(child);
      return Promise.resolve(null);
    });

    // Mock the save method to simulate updating the location
    mockRepository.save.mockImplementation((updatedLocation) => {
      const result = { ...updatedLocation };
      if (updatedLocation.id === childId && updatedLocation.parentId === parent2Id) {
        result.path = `${parent2Id}.${childId}`;
      }
      return Promise.resolve(result);
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LocationModule],
    })
    .overrideProvider(getRepositoryToken(Location))
    .useValue(mockRepository)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update a location parent via API', async () => {
    const childId = 'c7723614-325f-4142-a8c9-b020af25e49b';
    const parent2Id = '5b7e87b2-4daf-46c2-b3a5-a1e1986872b0';
    
    // Update child to move to parent2
    const updateDto: UpdateLocationDto = {
      parentId: parent2Id,
    };

    const response = await request(app.getHttpServer())
      .patch(`/api/locations/${childId}`)
      .send(updateDto)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(childId);
    expect(response.body.parentId).toBe(parent2Id);
    expect(response.body.path).toBe(`${parent2Id}.${childId}`);
  });
});