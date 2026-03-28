export type RoomType = 'user' | 'topic' | 'channel';

export function buildRoomName(projectId: string, type: RoomType, target: string): string {
  return `${projectId}:${type}:${target}`;
}

export function parseRoomName(room: string): { projectId: string; type: RoomType; target: string } | null {
  const parts = room.split(':');
  if (parts.length !== 3) return null;
  const [projectId, type, target] = parts;
  if (type !== 'user' && type !== 'topic' && type !== 'channel') return null;
  return { projectId, type, target };
}
