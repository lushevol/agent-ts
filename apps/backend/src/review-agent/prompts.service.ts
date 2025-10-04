import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDatabaseService } from './mock-database.service';
import {
  CreatePromptPayload,
  Prompt,
  PromptAdjustmentResult,
  PromptScope,
  UpdatePromptPayload
} from './review-agent.types';
import { RegressionService } from './regression.service';

@Injectable()
export class PromptsService {
  constructor(
    private readonly db: MockDatabaseService,
    private readonly regressionService: RegressionService
  ) {}

  list(scope?: PromptScope): Prompt[] {
    return this.db.getPrompts(scope);
  }

  create(payload: CreatePromptPayload): { prompt: Prompt; regression: string } {
    const prompt = this.db.createPrompt(payload);
    const regression = this.regressionService.runSuite('regression-core', {
      triggeredBy: 'prompt-create',
      notes: `Prompt ${prompt.id} created`
    });
    return { prompt, regression: regression.id };
  }

  update(id: string, payload: UpdatePromptPayload): { prompt: Prompt; regression: string } {
    const prompt = this.db.updatePrompt(id, payload);

    const regression = this.regressionService.runSuite('regression-core', {
      triggeredBy: 'prompt-update',
      notes: `Prompt ${prompt.id} updated`
    });

    return { prompt, regression: regression.id };
  }

  delete(id: string): void {
    this.db.deletePrompt(id);
  }

  getById(id: string): Prompt {
    try {
      return this.db.getPromptById(id);
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }

  previewRegression(id: string) {
    this.getById(id);
    return this.regressionService.runSuite('regression-preview', {
      triggeredBy: 'prompt-preview',
      notes: `Preview regression for prompt ${id}`
    });
  }

  applyFeedbackSignals(options: {
    promptIds?: string[];
    action?: 'promote-guidance' | 'demote-guidance';
    comment?: string;
    falsePositive: boolean;
    confidence?: number;
  }): PromptAdjustmentResult[] {
    const promptIds = options.promptIds ?? this.db.getPrompts().map((prompt) => prompt.id);

    if (promptIds.length === 0) {
      throw new NotFoundException('No prompts available to adjust');
    }

    return this.db.autoTunePrompts({
      promptIds,
      action: options.action,
      comment: options.comment,
      falsePositive: options.falsePositive,
      confidence: options.confidence
    });
  }
}
