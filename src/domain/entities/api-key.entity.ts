export interface ApiKey {
  id: string;
  projectId: string;
  keyHash: string;
  scope: 'publish' | 'admin' | 'read';
  status: 'active' | 'revoked';
  createdAt: Date;
}
