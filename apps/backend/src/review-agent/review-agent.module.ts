import { Module } from '@nestjs/common';
import { MockDatabaseService } from './mock-database.service';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './prompts.service';
import { RegressionService } from './regression.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { IssueClassificationsController } from './issue-classifications.controller';
import { IssueClassificationsService } from './issue-classifications.service';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  providers: [MockDatabaseService, ReviewsService, PromptsService, RegressionService, IssueClassificationsService, ApiKeyGuard],
  controllers: [ReviewsController, PromptsController, IssueClassificationsController]
})
export class ReviewAgentModule {}
