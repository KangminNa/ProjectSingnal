import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository, DRIZZLE } from '@core/base.repository';
import { projects } from '@infrastructure/persistence/schema';
import type { Project } from '@core/entities';

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, projects);
  }

  protected toEntity(row: any): Project {
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

  async create(input: { userId: string; name: string; slug: string }): Promise<Project> {
    return this.insert(input);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(projects.slug, slug));
    return row ? this.toEntity(row) : null;
  }

  async listByUserId(userId: string): Promise<Project[]> {
    return this.listWhere(projects.userId, userId);
  }

  async listAll(limit = 100): Promise<Project[]> {
    const safeLimit = Math.min(Math.max(1, limit), 500);
    const rows = await this.db.select().from(this.table).limit(safeLimit);
    return rows.map((r: any) => this.toEntity(r));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.updateById(id, { status, updatedAt: new Date() });
  }
}
