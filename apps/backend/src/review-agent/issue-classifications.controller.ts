import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IssueClassificationsService } from './issue-classifications.service';
import {
  CreateIssueClassificationPayload,
  IssueClassification,
  UpdateIssueClassificationPayload
} from './review-agent.types';
import { ApiKeyGuard } from './api-key.guard';

@Controller('issue-classifications')
@UseGuards(ApiKeyGuard)
export class IssueClassificationsController {
  constructor(private readonly issueClassificationsService: IssueClassificationsService) {}

  @Get()
  list(
    @Query('category') category?: IssueClassification['category'],
    @Query('language') language?: IssueClassification['language'],
    @Query('severity') severity?: IssueClassification['severity']
  ) {
    const filter = {
      ...(category ? { category } : {}),
      ...(language ? { language } : {}),
      ...(severity ? { severity } : {})
    };

    return this.issueClassificationsService.list(filter);
  }

  @Post()
  create(@Body() payload: CreateIssueClassificationPayload) {
    return this.issueClassificationsService.create(payload);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateIssueClassificationPayload) {
    return this.issueClassificationsService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.issueClassificationsService.delete(id);
    return { id };
  }
}
