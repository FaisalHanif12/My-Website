import { Router } from 'express';

export const HEALTH_BODY = { ok: true, status: 'up' } as const;

/** GET and HEAD /health (Express answers HEAD with the GET route, without a body). */
export function createHealthRouter(): Router {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.status(200).json(HEALTH_BODY);
  });
  return router;
}
