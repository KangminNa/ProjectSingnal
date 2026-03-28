import { Project } from '@domain/entities/project.entity';

export interface CreateProjectInput {
  userId: string;
  name: string;
  slug: string;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  listByUserId(userId: string): Promise<Project[]>;
  listAll(): Promise<Project[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
