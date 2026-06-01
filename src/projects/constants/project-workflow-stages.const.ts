import { ProjectWorkflowType } from 'src/generated/prisma/enums';

export const PROJECT_WORKFLOW_STAGE_PRESETS: Partial<
  Record<ProjectWorkflowType, string[]>
> = {
  [ProjectWorkflowType.DEVELOPMENT]: [
    'Backlog',
    'To Do',
    'In Progress',
    'Code Review',
    'Testing',
    'Done',
  ],

  [ProjectWorkflowType.DESIGN]: [
    'Ideas',
    'Wireframe',
    'Design',
    'Review',
    'Approved',
  ],

  [ProjectWorkflowType.SIMPLE]: [
    'Backlog',
    'To Do',
    'In Progress',
    'Review',
    'Done',
  ],
};
