import { Router } from 'express';

export const router = Router();

router.get('/', (req, res) => {
  const data = {
    contact: '4z41d1.xyz',
    documentation: 'Check me out!',
  };
  res.json(data);
});
