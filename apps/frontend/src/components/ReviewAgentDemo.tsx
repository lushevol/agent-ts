import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const API_KEY = import.meta.env.VITE_API_KEY ?? 'demo-key';

type ReviewIssue = {
  id: string;
  file: string;
  line: number;
  description: string;
  suggestion: string;
  suggestionCode: string;
  severity: string;
  priority: string;
  category: string;
  confidence: number;
  falsePositive?: boolean;
};

type ReviewResponse = {
  id: string;
  prId: string;
  status: string;
  createdAt: string;
  issues: ReviewIssue[];
  promptsUsed: Record<string, string>;
  regressionResults?: {
    suiteId: string;
    status: string;
    executedAt: string;
  };
};

type Prompt = {
  id: string;
  scope: string;
  name: string;
  content: string;
  updatedAt: string;
  version: number;
  lastFeedbackSnapshotId?: string;
};

type PromptCreateResponse = {
  prompt: Prompt;
  regression: string;
};

type IssueClassification = {
  id: string;
  category: string;
  language: string;
  description: string;
  suggestion: string;
  suggestionCode: string;
  severity: string;
  priority: string;
};

type PromptAdjustment = {
  prompt: Prompt;
  aggregate: {
    positiveSignal: number;
    negativeSignal: number;
    computedAt: string;
  };
  regression: {
    id: string;
    suiteId: string;
    status: string;
    executedAt: string;
  };
};

type FeedbackResponse = {
  issue: ReviewIssue;
  adjustments: PromptAdjustment[];
};

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  };
}

export function ReviewAgentDemo() {
  const [prId, setPrId] = useState('PR-1024');
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptRegressionIds, setPromptRegressionIds] = useState<Record<string, string>>({});
  const [classifications, setClassifications] = useState<IssueClassification[]>([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [loadingClassifications, setLoadingClassifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState({ scope: 'overall', name: '', content: '' });
  const [newClassification, setNewClassification] = useState({
    category: '',
    language: '',
    description: '',
    suggestion: '',
    suggestionCode: '',
    severity: '',
    priority: ''
  });
  const [feedbackComment, setFeedbackComment] = useState('');

  const resetMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const fetchPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    resetMessages();
    try {
      const response = await fetch(`${API_BASE_URL}/prompts`, {
        headers: buildHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to load prompts');
      }
      const data = (await response.json()) as Prompt[];
      setPrompts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingPrompts(false);
    }
  }, [resetMessages]);

  const fetchClassifications = useCallback(async () => {
    setLoadingClassifications(true);
    resetMessages();
    try {
      const response = await fetch(`${API_BASE_URL}/issue-classifications`, {
        headers: buildHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to load issue classifications');
      }
      const data = (await response.json()) as IssueClassification[];
      setClassifications(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingClassifications(false);
    }
  }, [resetMessages]);

  useEffect(() => {
    fetchPrompts().catch(() => undefined);
    fetchClassifications().catch(() => undefined);
  }, [fetchPrompts, fetchClassifications]);

  const activePromptIds = useMemo(() => prompts.map((prompt) => prompt.id), [prompts]);

  const runReview = useCallback(
    async (id: string) => {
      setLoadingReview(true);
      resetMessages();
      try {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify({ prId: id })
        });
        if (!response.ok) {
          throw new Error('Review failed to start');
        }
        const data = (await response.json()) as ReviewResponse;
        setReview(data);
        setSuccess(`Review ${data.id} completed with status ${data.status.toUpperCase()}`);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingReview(false);
      }
    },
    [resetMessages]
  );

  const submitFeedback = useCallback(
    async (issueId: string, falsePositive: boolean) => {
      if (!review) return;
      resetMessages();
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/${review.id}/issues/${issueId}/feedback`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify({
            falsePositive,
            comment: feedbackComment || undefined,
            reviewerId: 'demo-reviewer',
            feedbackSignals: {
              promptIds: activePromptIds,
              action: falsePositive ? 'demote-guidance' : 'promote-guidance',
              confidence: 0.85
            }
          })
        });
        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }
        const data = (await response.json()) as FeedbackResponse;
        setReview((prev) =>
          prev
            ? {
                ...prev,
                issues: prev.issues.map((issue) => (issue.id === issueId ? { ...issue, ...data.issue } : issue))
              }
            : prev
        );
        setPrompts((prev) =>
          prev.map((prompt) => {
            const adjustment = data.adjustments.find((item) => item.prompt.id === prompt.id);
            return adjustment ? adjustment.prompt : prompt;
          })
        );
        setPromptRegressionIds((prev) => {
          const next = { ...prev };
          data.adjustments.forEach((adjustment) => {
            next[adjustment.prompt.id] = adjustment.regression.id;
          });
          return next;
        });
        setSuccess('Feedback captured and prompts auto-tuned.');
        setFeedbackComment('');
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [activePromptIds, feedbackComment, resetMessages, review]
  );

  const createPrompt = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessages();
      try {
        const response = await fetch(`${API_BASE_URL}/prompts`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(newPrompt)
        });
        if (!response.ok) {
          throw new Error('Failed to create prompt');
        }
        const data = (await response.json()) as PromptCreateResponse;
        setPrompts((prev) => [...prev, data.prompt]);
        setPromptRegressionIds((prev) => ({ ...prev, [data.prompt.id]: data.regression }));
        setNewPrompt({ scope: 'overall', name: '', content: '' });
        setSuccess(`Prompt ${data.prompt.name} created.`);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [newPrompt, resetMessages]
  );

  const createClassification = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      resetMessages();
      try {
        const response = await fetch(`${API_BASE_URL}/issue-classifications`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(newClassification)
        });
        if (!response.ok) {
          throw new Error('Failed to create issue classification');
        }
        const data = (await response.json()) as IssueClassification;
        setClassifications((prev) => [...prev, data]);
        setNewClassification({
          category: '',
          language: '',
          description: '',
          suggestion: '',
          suggestionCode: '',
          severity: '',
          priority: ''
        });
        setSuccess(`Classification ${data.category} created.`);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [newClassification, resetMessages]
  );

  const previewRegression = useCallback(
    async (promptId: string) => {
      resetMessages();
      try {
        const response = await fetch(`${API_BASE_URL}/prompts/${promptId}/preview-regression`, {
          method: 'POST',
          headers: buildHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to run regression preview');
        }
        const data = await response.json();
        setPromptRegressionIds((prev) => ({ ...prev, [promptId]: data.id }));
        setSuccess(`Regression preview ${data.id} executed.`);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [resetMessages]
  );

  return (
    <section className="grid gap-6 rounded-xl border bg-card/60 p-6 shadow-sm">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Pull Request Review Agent</h2>
        <p className="text-sm text-muted-foreground">
          Trigger reviews, inspect issues, manage prompts, and curate issue classifications backed by the mock Mastra service.
        </p>
      </header>

      {error && <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md border border-emerald-500 bg-emerald-500/10 p-3 text-sm text-emerald-600">{success}</div>}

      <section className="grid gap-4">
        <h3 className="text-lg font-medium">1. Run a review</h3>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="pr-id">
              Pull Request ID
            </label>
            <Input
              id="pr-id"
              value={prId}
              onChange={(event) => setPrId(event.target.value)}
              placeholder="e.g. PR-1024"
            />
          </div>
          <Button
            type="button"
            onClick={() => runReview(prId)}
            disabled={!prId || loadingReview}
          >
            {loadingReview ? 'Running review…' : 'Run review'}
          </Button>
        </div>
        {review && (
          <div className="rounded-lg border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Review ID</p>
                <p className="font-semibold">{review.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className={review.status === 'pass' ? 'font-semibold text-emerald-600' : 'font-semibold text-red-500'}>
                  {review.status.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <h4 className="font-semibold">Issues</h4>
              <div className="grid gap-3">
                {review.issues.map((issue) => (
                  <div key={issue.id} className="rounded-md border border-border bg-card/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {issue.file}:{issue.line}
                        </p>
                        <p className="font-semibold">{issue.description}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>
                          {issue.severity.toUpperCase()} • {issue.priority.toUpperCase()} • Confidence {issue.confidence}
                        </p>
                        {issue.falsePositive && <p className="font-medium text-amber-600">Marked as false positive</p>}
                      </div>
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap rounded bg-muted/70 p-3 text-sm">{issue.suggestionCode}</pre>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Textarea
                        value={feedbackComment}
                        onChange={(event) => setFeedbackComment(event.target.value)}
                        placeholder="Leave reviewer feedback"
                        className="min-w-[240px] flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => submitFeedback(issue.id, true)}
                      >
                        Flag false positive
                      </Button>
                      <Button type="button" onClick={() => submitFeedback(issue.id, false)}>
                        Approve suggestion
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {review.regressionResults && (
                <div className="rounded-md border border-dashed border-emerald-400 bg-emerald-400/10 p-3 text-sm text-emerald-700">
                  Regression {review.regressionResults.suiteId} • {review.regressionResults.status.toUpperCase()} •
                  executed at {new Date(review.regressionResults.executedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h3 className="text-lg font-medium">2. Manage prompts</h3>
        <div className="grid gap-2">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createPrompt}>
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="prompt-scope">
                Scope
              </label>
              <select
                id="prompt-scope"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={newPrompt.scope}
                onChange={(event) => setNewPrompt((prev) => ({ ...prev, scope: event.target.value }))
              >
                <option value="overall">Overall</option>
                <option value="project">Project</option>
                <option value="repository">Repository</option>
                <option value="language">Language</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="prompt-name">
                Name
              </label>
              <Input
                id="prompt-name"
                value={newPrompt.name}
                onChange={(event) => setNewPrompt((prev) => ({ ...prev, name: event.target.value }))
                placeholder="Prompt name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium" htmlFor="prompt-content">
                Content
              </label>
              <Textarea
                id="prompt-content"
                value={newPrompt.content}
                onChange={(event) => setNewPrompt((prev) => ({ ...prev, content: event.target.value }))
                placeholder="Enter prompt guidance"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={!newPrompt.name || !newPrompt.content || loadingPrompts}>
                Add prompt
              </Button>
            </div>
          </form>
        </div>
        <div className="grid gap-3">
          {loadingPrompts ? (
            <p className="text-sm text-muted-foreground">Loading prompts…</p>
          ) : (
            <div className="grid gap-3">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="rounded-md border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {prompt.scope.toUpperCase()} • v{prompt.version}
                      </p>
                      <h4 className="text-lg font-semibold">{prompt.name}</h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{prompt.content}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Updated {new Date(prompt.updatedAt).toLocaleString()}</p>
                      {prompt.lastFeedbackSnapshotId && <p>Snapshot {prompt.lastFeedbackSnapshotId}</p>}
                      {promptRegressionIds[prompt.id] && <p>Last regression {promptRegressionIds[prompt.id]}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button type="button" variant="secondary" onClick={() => previewRegression(prompt.id)}>
                      Preview regression
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="text-lg font-medium">3. Issue classification catalog</h3>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={createClassification}>
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-category">
              Category
            </label>
            <Input
              id="classification-category"
              value={newClassification.category}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, category: event.target.value }))
              placeholder="robustness"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-language">
              Language
            </label>
            <Input
              id="classification-language"
              value={newClassification.language}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, language: event.target.value }))
              placeholder="typescript"
            />
          </div>
          <div className="md:col-span-2 grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-description">
              Description
            </label>
            <Textarea
              id="classification-description"
              value={newClassification.description}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, description: event.target.value }))
              placeholder="Describe the issue pattern"
            />
          </div>
          <div className="md:col-span-2 grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-suggestion">
              Suggestion
            </label>
            <Textarea
              id="classification-suggestion"
              value={newClassification.suggestion}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, suggestion: event.target.value }))
              placeholder="How should reviewers address the issue?"
            />
          </div>
          <div className="md:col-span-2 grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-suggestion-code">
              Suggestion code
            </label>
            <Textarea
              id="classification-suggestion-code"
              value={newClassification.suggestionCode}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, suggestionCode: event.target.value }))
              placeholder="Provide a code snippet"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-severity">
              Severity
            </label>
            <Input
              id="classification-severity"
              value={newClassification.severity}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, severity: event.target.value }))
              placeholder="high"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="classification-priority">
              Priority
            </label>
            <Input
              id="classification-priority"
              value={newClassification.priority}
              onChange={(event) => setNewClassification((prev) => ({ ...prev, priority: event.target.value }))
              placeholder="p0"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button
              type="submit"
              disabled={
                !newClassification.category ||
                !newClassification.language ||
                !newClassification.description ||
                !newClassification.suggestion ||
                !newClassification.suggestionCode ||
                !newClassification.severity ||
                !newClassification.priority ||
                loadingClassifications
              }
            >
              Add classification
            </Button>
          </div>
        </form>
        <div className="grid gap-3">
          {loadingClassifications ? (
            <p className="text-sm text-muted-foreground">Loading classifications…</p>
          ) : (
            <div className="grid gap-2">
              {classifications.map((classification) => (
                <div key={classification.id} className="rounded-md border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {classification.category.toUpperCase()} • {classification.language}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Severity {classification.severity.toUpperCase()} • Priority {classification.priority.toUpperCase()}
                      </p>
                    </div>
                    <code className="text-xs text-muted-foreground">{classification.id}</code>
                  </div>
                  <p className="mt-3 text-sm">{classification.description}</p>
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-muted/70 p-3 text-sm">
                    {classification.suggestion}

{classification.suggestionCode}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
