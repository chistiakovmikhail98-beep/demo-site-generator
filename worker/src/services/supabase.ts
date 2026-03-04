// Re-export everything from db.ts — Supabase replaced with direct PostgreSQL
export {
  pool,
  getNextQueueItem,
  completeQueueItem,
  failQueueItem,
  requeueItem,
  setQueueItemProject,
  resetStuckItems,
  createProject,
  updateProject,
  getProject,
  uploadImage,
  saveAiCost,
  saveTokenStats,
} from './db.js';

export type { QueueItem, DbProject } from './db.js';
