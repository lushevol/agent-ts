import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateFeedbackPayload, CreateReviewPayload } from './review-agent.types';
import { ApiKeyGuard } from './api-key.guard';

@Controller('reviews')
@UseGuards(ApiKeyGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() payload: CreateReviewPayload) {
    return this.reviewsService.runReview(payload);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.reviewsService.getReview(id);
  }

  @Post(':id/issues/:issueId/feedback')
  submitFeedback(
    @Param('id') id: string,
    @Param('issueId') issueId: string,
    @Body() payload: CreateFeedbackPayload
  ) {
    return this.reviewsService.submitFeedback(id, issueId, payload);
  }
}
