import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not defined');
    }

    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 10000,
      lazyConnect: true,
      tls: {}, 
    };

    this.client = new Redis(redisUrl, options);

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async enqueue(queueName: string, task: any): Promise<number> {
    try {
      const taskData = JSON.stringify(task);
      const position = await this.client.lpush(queueName, taskData);
      this.logger.log(`Task enqueued to ${queueName}. Position: ${position}`);
      return position;
    } catch (error) {
      this.logger.error(`Failed to enqueue task to ${queueName}:`, error);
      throw error;
    }
  }

  async getQueueLength(queueName: string): Promise<number> {
    try {
      return await this.client.llen(queueName);
    } catch (error) {
      this.logger.error(`Failed to get queue length for ${queueName}:`, error);
      throw error;
    }
  }

  async peekNext(queueName: string): Promise<any> {
    try {
      const taskData = await this.client.lindex(queueName, -1);
      return taskData ? JSON.parse(taskData) : null;
    } catch (error) {
      this.logger.error(`Failed to peek next task in ${queueName}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
