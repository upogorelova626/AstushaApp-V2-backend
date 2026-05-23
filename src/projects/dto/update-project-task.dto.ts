import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateProjectTaskDto } from './create-project-task.dto';

export class UpdateProjectTaskDto extends PartialType(
  OmitType(CreateProjectTaskDto, ['workflowStageId'] as const),
) {}
