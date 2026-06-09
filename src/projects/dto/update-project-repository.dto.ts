import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectRepositoryDto } from './create-project-repository.dto';

export class UpdateProjectRepositoryDto extends PartialType(
  CreateProjectRepositoryDto,
) {}
