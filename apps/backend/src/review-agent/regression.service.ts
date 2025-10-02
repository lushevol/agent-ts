import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from './mock-database.service';
import { RegressionRun } from './review-agent.types';

@Injectable()
export class RegressionService {
  constructor(private readonly db: MockDatabaseService) {}

  runSuite(suiteId: string, options: { reviewId?: string; triggeredBy?: string; notes?: string } = {}): RegressionRun {
    return this.db.recordRegressionRun({
      suiteId,
      status: 'pass',
      reviewId: options.reviewId,
      triggeredBy: options.triggeredBy,
      notes: options.notes
    });
  }
}
