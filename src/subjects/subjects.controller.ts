import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto, @Request() req) {
    return this.subjectsService.create(createSubjectDto, req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.subjectsService.findAllByUser(req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.subjectsService.remove(id, req.user.sub);
  }
}
