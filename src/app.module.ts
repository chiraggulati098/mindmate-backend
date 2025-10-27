import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost/nest'),
    AuthModule, 
    UsersModule, SubjectsModule, DocumentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}