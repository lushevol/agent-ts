import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from './mock-database.service';
import {
  CreateIssueClassificationPayload,
  IssueClassification,
  UpdateIssueClassificationPayload
} from './review-agent.types';

@Injectable()
export class IssueClassificationsService {
  constructor(private readonly db: MockDatabaseService) {}

  list(filter?: Partial<Pick<IssueClassification, 'category' | 'language' | 'severity'>>): IssueClassification[] {
    return this.db.getIssueClassifications(filter);
  }

  create(payload: CreateIssueClassificationPayload): IssueClassification {
    return this.db.createIssueClassification(payload);
  }

  update(id: string, payload: UpdateIssueClassificationPayload): IssueClassification {
    return this.db.updateIssueClassification(id, payload);
  }

  delete(id: string): void {
    this.db.deleteIssueClassification(id);
  }
}
