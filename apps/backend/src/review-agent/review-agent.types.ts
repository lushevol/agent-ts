export type ReviewStatus = 'pass' | 'fail';
export type RegressionStatus = 'pass' | 'fail';
export type PromptScope = 'overall' | 'project' | 'repository' | 'language';

export interface PullRequestChange {
  line: number;
  type: 'addition' | 'deletion' | 'modification';
  content: string;
}

export interface PullRequestFile {
  path: string;
  changes: PullRequestChange[];
}

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  author: string;
  files: PullRequestFile[];
}

export interface IssueFeedbackSignal {
  promptIds?: string[];
  action?: 'promote-guidance' | 'demote-guidance';
  confidence?: number;
}

export interface IssueFeedback {
  id: string;
  issueId: string;
  falsePositive: boolean;
  comment?: string;
  reviewerId: string;
  submittedAt: string;
  feedbackSignals?: IssueFeedbackSignal;
}

export interface ReviewIssue {
  id: string;
  reviewId: string;
  file: string;
  line: number;
  description: string;
  suggestion: string;
  suggestionCode: string;
  severity: string;
  priority: string;
  category: string;
  confidence: number;
  classificationId: string;
  falsePositive?: boolean;
  feedback?: IssueFeedback[];
}

export interface RegressionRun {
  id: string;
  suiteId: string;
  status: RegressionStatus;
  executedAt: string;
  reviewId?: string;
  triggeredBy?: string;
  notes?: string;
}

export interface ReviewRecord {
  id: string;
  prId: string;
  status: ReviewStatus;
  createdAt: string;
  issues: ReviewIssue[];
  promptsUsed: Record<PromptScope, string>;
  regressionResults?: Pick<RegressionRun, 'suiteId' | 'status' | 'executedAt'>;
}

export interface Prompt {
  id: string;
  scope: PromptScope;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  lastFeedbackSnapshotId?: string;
}

export interface IssueClassification {
  id: string;
  category: string;
  language: string;
  description: string;
  suggestion: string;
  suggestionCode: string;
  severity: string;
  priority: string;
}

export interface PromptFeedbackAggregate {
  id: string;
  promptId: string;
  computedAt: string;
  positiveSignal: number;
  negativeSignal: number;
}

export interface PromptAdjustmentResult {
  prompt: Prompt;
  aggregate: PromptFeedbackAggregate;
  regression: RegressionRun;
}

export interface CreateReviewPayload {
  prId: string;
}

export interface CreateFeedbackPayload {
  falsePositive: boolean;
  comment?: string;
  reviewerId: string;
  feedbackSignals?: IssueFeedbackSignal;
}

export interface CreatePromptPayload {
  scope: PromptScope;
  name: string;
  content: string;
}

export interface UpdatePromptPayload {
  scope?: PromptScope;
  name?: string;
  content?: string;
}

export interface CreateIssueClassificationPayload {
  category: string;
  language: string;
  description: string;
  suggestion: string;
  suggestionCode: string;
  severity: string;
  priority: string;
}

export interface UpdateIssueClassificationPayload extends Partial<CreateIssueClassificationPayload> {}
