export interface Publisher {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}
