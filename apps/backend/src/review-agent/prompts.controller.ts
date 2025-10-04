import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptPayload, PromptScope, UpdatePromptPayload } from './review-agent.types';
import { ApiKeyGuard } from './api-key.guard';

@Controller('prompts')
@UseGuards(ApiKeyGuard)
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get()
  list(@Query('scope') scope?: PromptScope) {
    return this.promptsService.list(scope);
  }

  @Post()
  create(@Body() payload: CreatePromptPayload) {
    return this.promptsService.create(payload);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdatePromptPayload) {
    return this.promptsService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.promptsService.delete(id);
    return { id };
  }

  @Post(':id/preview-regression')
  previewRegression(@Param('id') id: string) {
    return this.promptsService.previewRegression(id);
  }
}
