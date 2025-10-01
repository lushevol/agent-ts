import { Injectable, Logger } from '@nestjs/common';
import { Mastra } from 'mastra';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatResponse = {
  output: string;
  meta?: Record<string, unknown>;
};

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agent = new Mastra({
    name: 'backend-agent',
    description: 'Primary orchestrator for the agent-ts project'
  });

  async chat(message: string): Promise<ChatResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are the backend orchestrator responding to frontend requests.'
      },
      {
        role: 'user',
        content: message
      }
    ];

    if (typeof (this.agent as { run?: (input: unknown) => Promise<unknown> }).run === 'function') {
      const result = await (this.agent as { run: (input: { messages: ChatMessage[] }) => Promise<{ output: string }> }).run({
        messages
      });

      return {
        output: result.output,
        meta: { provider: 'mastra' }
      };
    }

    this.logger.warn('Mastra agent run() implementation not detected, falling back to echo response.');
    return {
      output: `Mastra fallback response: ${message}`,
      meta: { provider: 'fallback' }
    };
  }
}
