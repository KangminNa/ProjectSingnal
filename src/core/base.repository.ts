import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '@core/injection-tokens';

export { DRIZZLE };

/**
 * BaseRepository<TEntity>
 *
 * 모든 Repository의 공통 로직을 추상화합니다.
 * 각 모듈의 Repository는 이 클래스를 상속하고
 * schema와 toEntity()만 구현하면 기본 CRUD를 사용할 수 있습니다.
 *
 * @example
 * class ProjectRepository extends BaseRepository<Project> {
 *   constructor(@Inject(DRIZZLE) db: any) {
 *     super(db, projects);  // projects = Drizzle schema
 *   }
 *   protected toEntity(row: any): Project { return { ... }; }
 * }
 */
export abstract class BaseRepository<TEntity> {
  constructor(
    @Inject(DRIZZLE) protected readonly db: any,
    protected readonly table: any,
  ) {}

  /** DB row → Entity 변환 (각 Repository가 구현) */
  protected abstract toEntity(row: any): TEntity;

  async findById(id: string): Promise<TEntity | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return row ? this.toEntity(row) : null;
  }

  async insert(values: Record<string, any>): Promise<TEntity> {
    const [row] = await this.db
      .insert(this.table)
      .values(values)
      .returning();
    return this.toEntity(row);
  }

  async updateById(id: string, values: Record<string, any>): Promise<void> {
    await this.db
      .update(this.table)
      .set(values)
      .where(eq(this.table.id, id));
  }

  async listWhere(column: any, value: any): Promise<TEntity[]> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(column, value));
    return rows.map((r: any) => this.toEntity(r));
  }
}
