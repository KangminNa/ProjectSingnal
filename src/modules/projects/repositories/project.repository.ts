import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@common/constants/injection-tokens';
import { projects } from '@infrastructure/database/schema';
import {
  ProjectRepository as IProjectRepository,
  CreateProjectInput,
} from '@domain/ports/outbound/repositories/project.repository.port';
import { Project } from '@domain/entities/project.entity';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  async create(input: CreateProjectInput): Promise<Project> {
    const [row] = await this.db.insert(projects).values(input).returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await this.db.select().from(projects).where(eq(projects.id, id));
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const [row] = await this.db.select().from(projects).where(eq(projects.slug, slug));
    return row ? this.toEntity(row) : null;
  }

  async listByUserId(userId: string): Promise<Project[]> {
    const rows = await this.db.select().from(projects).where(eq(projects.userId, userId));
    return rows.map((r: any) => this.toEntity(r));
  }

  async listAll(): Promise<Project[]> {
    const rows = await this.db.select().from(projects);
    return rows.map((r: any) => this.toEntity(r));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, id));
  }

  private toEntity(row: any): Project {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      slug: row.slug,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
