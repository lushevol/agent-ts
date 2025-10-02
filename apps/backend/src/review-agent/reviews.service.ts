import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from './mock-database.service';
import {
  CreateFeedbackPayload,
  CreateReviewPayload,
  PromptAdjustmentResult,
  ReviewIssue,
  ReviewRecord
} from './review-agent.types';
import { PromptsService } from './prompts.service';
import { RegressionService } from './regression.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly db: MockDatabaseService,
    private readonly promptsService: PromptsService,
    private readonly regressionService: RegressionService
  ) {}

  runReview(payload: CreateReviewPayload): ReviewRecord {
    const review = this.db.createReview(payload.prId);
    const regression = this.regressionService.runSuite('regression-core', {
      reviewId: review.id,
      triggeredBy: 'review-created',
      notes: `Regression executed after review ${review.id}`
    });

    return this.db.attachRegressionResult(review.id, regression);
  }

  getReview(id: string): ReviewRecord {
    return this.db.getReview(id);
  }

  submitFeedback(reviewId: string, issueId: string, payload: CreateFeedbackPayload): {
    issue: ReviewIssue;
    adjustments: PromptAdjustmentResult[];
  } {
    const feedback = this.buildFeedback(issueId, payload);
    const issue = this.db.addIssueFeedback(reviewId, issueId, feedback);

    const adjustments = payload.feedbackSignals?.promptIds?.length
      ? this.promptsService.applyFeedbackSignals({
          promptIds: payload.feedbackSignals.promptIds,
          action: payload.feedbackSignals.action,
          comment: payload.comment,
          falsePositive: payload.falsePositive,
          confidence: payload.feedbackSignals.confidence
        })
      : this.promptsService.applyFeedbackSignals({
          action: payload.feedbackSignals?.action,
          comment: payload.comment,
          falsePositive: payload.falsePositive,
          confidence: payload.feedbackSignals?.confidence
        });

    return { issue, adjustments };
  }

  private buildFeedback(issueId: string, payload: CreateFeedbackPayload) {
    return {
      id: `feedback-${issueId}-${Date.now()}`,
      issueId,
      falsePositive: payload.falsePositive,
      comment: payload.comment,
      reviewerId: payload.reviewerId,
      submittedAt: new Date().toISOString(),
      feedbackSignals: payload.feedbackSignals
    };
  }
}
