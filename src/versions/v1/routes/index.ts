import { Router } from 'express';

export const router = Router();

router.get('/', (req, res) => {
  const data = {
    contact: 'orlandomm.net',
    documentation: 'vlresports.vercel.app',
  };
  res.json(data);
});
