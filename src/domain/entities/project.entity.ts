export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
