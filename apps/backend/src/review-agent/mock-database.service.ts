import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateIssueClassificationPayload,
  CreatePromptPayload,
  IssueClassification,
  IssueFeedback,
  Prompt,
  PromptAdjustmentResult,
  PromptFeedbackAggregate,
  PromptScope,
  PullRequest,
  ReviewIssue,
  ReviewRecord,
  UpdateIssueClassificationPayload,
  UpdatePromptPayload
} from './review-agent.types';
import { RegressionRun } from './review-agent.types';

interface PromptFeedbackUpdateOptions {
  promptIds: string[];
  action?: 'promote-guidance' | 'demote-guidance';
  comment?: string;
  falsePositive: boolean;
  confidence?: number;
}

@Injectable()
export class MockDatabaseService {
  private readonly prompts: Prompt[] = [
    {
      id: 'prompt-overall-default',
      scope: 'overall',
      name: 'Overall Reliability',
      content: 'Ensure submissions meet reliability and security standards.',
      createdAt: '2024-04-19T12:00:00.000Z',
      updatedAt: '2024-04-21T09:45:00.000Z',
      version: 3,
      lastFeedbackSnapshotId: 'feedback-aggregate-overall'
    },
    {
      id: 'prompt-project-backend',
      scope: 'project',
      name: 'Backend API Expectations',
      content: 'Backend services must validate external API responses and log failures.',
      createdAt: '2024-04-20T14:00:00.000Z',
      updatedAt: '2024-04-21T09:45:00.000Z',
      version: 2,
      lastFeedbackSnapshotId: 'feedback-aggregate-project'
    },
    {
      id: 'prompt-repository-agent',
      scope: 'repository',
      name: 'Agent Repository Guidance',
      content: 'Review NestJS controllers for missing guards and consistent DTO usage.',
      createdAt: '2024-04-20T14:30:00.000Z',
      updatedAt: '2024-04-21T09:45:00.000Z',
      version: 1
    },
    {
      id: 'prompt-language-typescript',
      scope: 'language',
      name: 'TypeScript Safety Net',
      content: 'TypeScript code should handle undefined values and narrow response types.',
      createdAt: '2024-04-19T12:00:00.000Z',
      updatedAt: '2024-04-21T09:45:00.000Z',
      version: 4,
      lastFeedbackSnapshotId: 'feedback-aggregate-language'
    }
  ];

  private readonly issueClassifications: IssueClassification[] = [
    {
      id: 'cls-robustness-null-check',
      category: 'robustness',
      language: 'typescript',
      description: 'Missing null or undefined guard before dereferencing values.',
      suggestion: 'Add null checks before using data from external sources.',
      suggestionCode: "if (!value) { throw new Error('Value is required'); }",
      severity: 'high',
      priority: 'p0'
    },
    {
      id: 'cls-logging',
      category: 'observability',
      language: 'typescript',
      description: 'Missing structured logging around external API failures.',
      suggestion: 'Log failures with context to aid debugging.',
      suggestionCode: "this.logger.error('External API failed', { prId });",
      severity: 'medium',
      priority: 'p1'
    }
  ];

  private readonly pullRequests: PullRequest[] = [
    {
      id: 'PR-1024',
      title: 'Add PR review agent endpoints',
      description: 'Implements review workflow and configuration management',
      status: 'OPEN',
      author: 'octocat',
      files: [
        {
          path: 'apps/backend/src/review-agent/review.service.ts',
          changes: [
            {
              line: 42,
              type: 'addition',
              content: 'return this.reviewService.runReview(dto);'
            },
            {
              line: 57,
              type: 'deletion',
              content: '// TODO: implement'
            }
          ]
        },
        {
          path: 'apps/backend/src/review-agent/mock-database.service.ts',
          changes: [
            {
              line: 12,
              type: 'addition',
              content: 'const review = await this.reviews.run(dto);'
            }
          ]
        }
      ]
    },
    {
      id: 'PR-2048',
      title: 'Improve prompt tuning pipeline',
      description: 'Adds automated prompt adjustments with reviewer feedback weighting',
      status: 'OPEN',
      author: 'codefox',
      files: [
        {
          path: 'apps/backend/src/prompts/prompts.service.ts',
          changes: [
            {
              line: 23,
              type: 'addition',
              content: 'aggregate.positiveSignal += weight;'
            }
          ]
        }
      ]
    }
  ];

  private readonly reviews: ReviewRecord[] = [];
  private readonly promptAggregates: PromptFeedbackAggregate[] = [
    {
      id: 'feedback-aggregate-overall',
      promptId: 'prompt-overall-default',
      computedAt: '2024-04-21T09:45:00.000Z',
      positiveSignal: 3,
      negativeSignal: 1
    },
    {
      id: 'feedback-aggregate-project',
      promptId: 'prompt-project-backend',
      computedAt: '2024-04-21T09:45:00.000Z',
      positiveSignal: 2,
      negativeSignal: 0
    },
    {
      id: 'feedback-aggregate-language',
      promptId: 'prompt-language-typescript',
      computedAt: '2024-04-21T09:45:00.000Z',
      positiveSignal: 4,
      negativeSignal: 2
    }
  ];
  private readonly feedback: IssueFeedback[] = [];
  private readonly regressionRuns: RegressionRun[] = [];

  getPrompts(scope?: PromptScope): Prompt[] {
    if (!scope) {
      return [...this.prompts];
    }

    return this.prompts.filter((prompt) => prompt.scope === scope);
  }

  getPromptById(id: string): Prompt {
    const prompt = this.prompts.find((item) => item.id === id);

    if (!prompt) {
      throw new NotFoundException(`Prompt ${id} not found`);
    }

    return prompt;
  }

  createPrompt(payload: CreatePromptPayload): Prompt {
    const timestamp = new Date().toISOString();
    const prompt: Prompt = {
      id: `prompt-${payload.scope}-${randomUUID()}`,
      scope: payload.scope,
      name: payload.name,
      content: payload.content,
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1
    };

    this.prompts.push(prompt);
    return prompt;
  }

  updatePrompt(id: string, payload: UpdatePromptPayload): Prompt {
    const prompt = this.getPromptById(id);
    const timestamp = new Date().toISOString();

    Object.assign(prompt, payload, { updatedAt: timestamp });

    if (payload.content) {
      prompt.version += 1;
    }

    return prompt;
  }

  deletePrompt(id: string): void {
    const index = this.prompts.findIndex((prompt) => prompt.id === id);

    if (index === -1) {
      throw new NotFoundException(`Prompt ${id} not found`);
    }

    this.prompts.splice(index, 1);
  }

  getPromptAggregate(promptId: string): PromptFeedbackAggregate {
    let aggregate = this.promptAggregates.find((item) => item.promptId === promptId);

    if (!aggregate) {
      aggregate = {
        id: `feedback-aggregate-${promptId}`,
        promptId,
        computedAt: new Date().toISOString(),
        positiveSignal: 0,
        negativeSignal: 0
      };
      this.promptAggregates.push(aggregate);
    }

    return aggregate;
  }

  updatePromptAggregate(
    promptId: string,
    signal: 'positive' | 'negative',
    weight: number
  ): PromptFeedbackAggregate {
    const aggregate = this.getPromptAggregate(promptId);

    if (signal === 'positive') {
      aggregate.positiveSignal = Number((aggregate.positiveSignal + weight).toFixed(2));
    } else {
      aggregate.negativeSignal = Number((aggregate.negativeSignal + weight).toFixed(2));
    }

    aggregate.computedAt = new Date().toISOString();
    return aggregate;
  }

  autoTunePrompts(options: PromptFeedbackUpdateOptions): PromptAdjustmentResult[] {
    const { promptIds, action, comment, falsePositive, confidence } = options;
    const now = new Date().toISOString();
    const weight = Number((confidence ?? 1).toFixed(2));

    return promptIds.map((promptId) => {
      const signal = falsePositive ? 'negative' : 'positive';
      const aggregate = this.updatePromptAggregate(promptId, signal, weight);
      const prompt = this.getPromptById(promptId);

      const noteAction = action ?? (falsePositive ? 'demote-guidance' : 'promote-guidance');
      const tuningNote =
        noteAction === 'demote-guidance'
          ? 'Reducing emphasis on guidance that produced a false positive.'
          : 'Emphasizing reviewer-approved suggestions for future runs.';

      prompt.version += 1;
      prompt.updatedAt = now;
      prompt.lastFeedbackSnapshotId = aggregate.id;

      const autoTuningLine = `[Auto-Tuning v${prompt.version}] ${tuningNote}${comment ? ` — ${comment}` : ''}`;

      if (!prompt.content.includes(autoTuningLine)) {
        prompt.content = `${prompt.content}\n\n${autoTuningLine}`.trim();
      }

      const regression = this.recordRegressionRun({
        suiteId: 'regression-core',
        status: 'pass',
        triggeredBy: 'prompt-auto-tuning'
      });

      return {
        prompt,
        aggregate,
        regression
      };
    });
  }

  getIssueClassifications(filter?: Partial<Pick<IssueClassification, 'category' | 'language' | 'severity'>>): IssueClassification[] {
    if (!filter || Object.keys(filter).length === 0) {
      return [...this.issueClassifications];
    }

    return this.issueClassifications.filter((classification) =>
      Object.entries(filter).every(([key, value]) =>
        value ? classification[key as keyof IssueClassification] === value : true
      )
    );
  }

  getIssueClassificationById(id: string): IssueClassification {
    const classification = this.issueClassifications.find((item) => item.id === id);

    if (!classification) {
      throw new NotFoundException(`Issue classification ${id} not found`);
    }

    return classification;
  }

  createIssueClassification(payload: CreateIssueClassificationPayload): IssueClassification {
    const classification: IssueClassification = {
      id: `cls-${randomUUID()}`,
      ...payload
    };

    this.issueClassifications.push(classification);
    return classification;
  }

  updateIssueClassification(id: string, payload: UpdateIssueClassificationPayload): IssueClassification {
    const classification = this.getIssueClassificationById(id);
    Object.assign(classification, payload);
    return classification;
  }

  deleteIssueClassification(id: string): void {
    const index = this.issueClassifications.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Issue classification ${id} not found`);
    }

    this.issueClassifications.splice(index, 1);
  }

  getPullRequest(prId: string): PullRequest {
    const pullRequest = this.pullRequests.find((item) => item.id === prId);

    if (!pullRequest) {
      throw new NotFoundException(`Pull request ${prId} not found in mock data`);
    }

    return pullRequest;
  }

  private resolvePromptsUsed(): Record<PromptScope, string> {
    const map: Record<PromptScope, string> = {
      overall: '',
      project: '',
      repository: '',
      language: ''
    };

    (['overall', 'project', 'repository', 'language'] as PromptScope[]).forEach((scope) => {
      const prompt = this.getPrompts(scope)[0];
      map[scope] = prompt?.content ?? '';
    });

    return map;
  }

  createReview(prId: string): ReviewRecord {
    const pullRequest = this.getPullRequest(prId);
    const reviewId = `review-${randomUUID()}`;
    const promptsUsed = this.resolvePromptsUsed();

    const issues: ReviewIssue[] = this.issueClassifications.slice(0, 2).map((classification, index) => ({
      id: `issue-${index + 1}-${randomUUID()}`,
      reviewId,
      file: pullRequest.files[index % pullRequest.files.length]?.path ?? 'unknown',
      line:
        pullRequest.files[index % pullRequest.files.length]?.changes[0]?.line ??
        1,
      description: classification.description,
      suggestion: classification.suggestion,
      suggestionCode: classification.suggestionCode,
      severity: classification.severity,
      priority: classification.priority,
      category: classification.category,
      confidence: Number((0.8 - index * 0.05).toFixed(2)),
      classificationId: classification.id,
      feedback: []
    }));

    const review: ReviewRecord = {
      id: reviewId,
      prId,
      status: issues.length > 0 ? 'fail' : 'pass',
      createdAt: new Date().toISOString(),
      issues,
      promptsUsed
    };

    this.reviews.push(review);
    return review;
  }

  getReview(reviewId: string): ReviewRecord {
    const review = this.reviews.find((item) => item.id === reviewId);

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    return review;
  }

  attachRegressionResult(reviewId: string, regression: RegressionRun): ReviewRecord {
    const review = this.getReview(reviewId);
    review.regressionResults = {
      suiteId: regression.suiteId,
      status: regression.status,
      executedAt: regression.executedAt
    };
    return review;
  }

  listReviews(): ReviewRecord[] {
    return [...this.reviews];
  }

  addIssueFeedback(reviewId: string, issueId: string, feedback: IssueFeedback): ReviewIssue {
    const review = this.getReview(reviewId);
    const issue = review.issues.find((item) => item.id === issueId);

    if (!issue) {
      throw new NotFoundException(`Issue ${issueId} not found for review ${reviewId}`);
    }

    issue.falsePositive = feedback.falsePositive ?? issue.falsePositive;
    issue.feedback = issue.feedback ?? [];
    issue.feedback.push(feedback);
    this.feedback.push(feedback);
    return issue;
  }

  recordRegressionRun(options: { suiteId: string; status: RegressionRun['status']; triggeredBy?: string; reviewId?: string; notes?: string }): RegressionRun {
    const run: RegressionRun = {
      id: `regression-${randomUUID()}`,
      suiteId: options.suiteId,
      status: options.status,
      executedAt: new Date().toISOString(),
      reviewId: options.reviewId,
      triggeredBy: options.triggeredBy,
      notes: options.notes
    };

    this.regressionRuns.push(run);
    return run;
  }

  getRegressionRuns(): RegressionRun[] {
    return [...this.regressionRuns];
  }
}
