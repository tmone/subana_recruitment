import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { IsNull as TypeOrmIsNull } from 'typeorm';

@Injectable()
export class LocationService {
    constructor(
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
    ) {}

    async create(createLocationDto: CreateLocationDto): Promise<Location> {
        const { parentId } = createLocationDto;
        let level = 0;
        let path = '';

        if (parentId) {
            // Use a direct check for parent instead of using findOne, to provide a more specific error
            const parent = await this.locationRepository.findOne({ where: { id: parentId } });
            if (!parent) {
                throw new NotFoundException(`Parent location with ID ${parentId} not found`);
            }
            level = parent.level + 1;
        }

        const location = this.locationRepository.create({
            ...createLocationDto,
            level,
        });

        const savedLocation = await this.locationRepository.save(location);
        
        // Update path after saving to include the location's own ID
        savedLocation.path = parentId 
            ? `${await this.getParentPath(parentId)}.${savedLocation.id}` 
            : savedLocation.id;
        
        return this.locationRepository.save(savedLocation);
    }

    async getParentPath(parentId: string): Promise<string> {
        const parent = await this.findOne(parentId);
        return parent.path;
    }

    async findAll(): Promise<Location[]> {
        return this.locationRepository.find({ 
            order: { path: 'ASC' } 
        });
    }

    async findOne(id: string): Promise<Location> {
        const location = await this.locationRepository.findOne({ where: { id } });
        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
        return location;
    }

    async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
        const location = await this.findOne(id);
        
        // Don't allow changing parent if it would create a cycle
        if (updateLocationDto.parentId && updateLocationDto.parentId !== location.parentId) {
            if (await this.wouldCreateCycle(id, updateLocationDto.parentId)) {
                throw new Error('Cannot move a location to its own descendant');
            }
            
            // Update level and path for this node and all its children
            const newParent = await this.findOne(updateLocationDto.parentId);
            const levelDiff = newParent.level + 1 - location.level;
            const oldPath = location.path;
            const newPath = `${newParent.path}.${id}`;
            
            await this.updateSubtreeLevelAndPath(id, levelDiff, oldPath, newPath);
        }

        Object.assign(location, updateLocationDto);
        return this.locationRepository.save(location);
    }

    async remove(id: string): Promise<void> {
        const location = await this.findOne(id);
        
        // Check if location has children
        const children = await this.getChildren(id);
        if (children.length > 0) {
            throw new Error('Cannot delete a location that has children');
        }
        
        await this.locationRepository.remove(location);
    }

    async getTree(): Promise<Location[]> {
        // Find root nodes (nodes with no parent)
        const roots = await this.locationRepository.find({
            where: { parentId: TypeOrmIsNull() },
        });
        
        // Build tree for each root
        for (const root of roots) {
            await this.buildTree(root);
        }
        
        return roots;
    }

    private async buildTree(node: Location): Promise<void> {
        const children = await this.locationRepository.find({
            where: { parentId: node.id },
        });
        
        node.children = children;
        
        for (const child of children) {
            await this.buildTree(child);
        }
    }

    async getChildren(id: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: { parentId: id },
        });
    }

    async findChildren(id: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: { parentId: id },
        });
    }

    private async wouldCreateCycle(nodeId: string, newParentId: string): Promise<boolean> {
        if (nodeId === newParentId) return true;
        
        let currentParentId = newParentId;
        while (currentParentId) {
            const parent = await this.locationRepository.findOne({
                where: { id: currentParentId },
                select: ['id', 'parentId'],
            });
            
            if (!parent) break;
            if (parent.id === nodeId) return true;
            
            currentParentId = parent.parentId ?? '';
        }
        
        return false;
    }

    private async updateSubtreeLevelAndPath(
        nodeId: string, 
        levelDiff: number, 
        oldPath: string, 
        newPath: string
    ): Promise<void> {
        // Update the node itself
        await this.locationRepository
            .createQueryBuilder()
            .update(Location)
            .set({ 
                level: () => `level + ${levelDiff}`,
                path: newPath 
            })
            .where("id = :id", { id: nodeId })
            .execute();
            
        // Update all descendants
        await this.locationRepository
            .createQueryBuilder()
            .update(Location)
            .set({ 
                level: () => `level + ${levelDiff}`,
                path: () => `REPLACE(path, '${oldPath}.', '${newPath}.')`
            })
            .where("path LIKE :pathPattern", { pathPattern: `${oldPath}.%` })
            .execute();
    }
}

function IsNull(): string | import("typeorm").FindOperator<string> | undefined {
    throw new Error('Function not implemented.');
}
