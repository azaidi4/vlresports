import { Redis } from 'ioredis';

export const newClient = () =>
  new Redis(
    parseInt(process.env.REDIS_PORT || '6379'),
    process.env.REDIS_HOST || 'localhost'
  );
