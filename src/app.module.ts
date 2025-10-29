import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { DocumentsModule } from './documents/documents.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') || 'mongodb://localhost/nest',
      }),
      inject: [ConfigService],
    }),
    AuthModule, 
    UsersModule, SubjectsModule, DocumentsModule, S3Module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}