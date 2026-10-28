import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { ok } from '../../utils/response.js';
import {
  createUserSchema,
  idParamsSchema,
  listQuerySchema,
  updateUserSchema,
} from './user.schema.js';
import { userService } from './user.service.js';

export const userRoutes = Router();
const adminOnly = requireRole('admin');

userRoutes.use(authenticate);

// Express 5 forwards rejected promises to the error handler automatically.
userRoutes.get('/', async (req, res) => {
  ok(res, await userService.list(listQuerySchema.parse(req.query)));
});

userRoutes.get('/:id', async (req, res) => {
  ok(res, await userService.get(idParamsSchema.parse(req.params).id));
});

userRoutes.post('/', adminOnly, async (req, res) => {
  ok(res, await userService.create(createUserSchema.parse(req.body)), 201);
});

userRoutes.put('/:id', adminOnly, async (req, res) => {
  const { id } = idParamsSchema.parse(req.params);
  ok(res, await userService.update(id, updateUserSchema.parse(req.body)));
});

userRoutes.delete('/:id', adminOnly, async (req, res) => {
  ok(res, await userService.remove(idParamsSchema.parse(req.params).id));
});
