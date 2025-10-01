import { useState } from 'react';
import { CopilotChat } from '@copilotkit/react-ui';
import { Button } from './ui/button';

export function AgentChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  return (
    <div className="grid gap-4">
      <CopilotChat
        className="rounded-lg border bg-card p-4 shadow-sm"
        messages={messages}
        onMessagesChange={setMessages}
        instructions="You are an assistant helping the user interact with the agent backend."
        submitOnEnter
      />
      <p className="text-sm text-muted-foreground">
        CopilotKit is wired to send chat entries to the backend API once the runtime endpoint is configured.
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          type="button"
          onClick={() => setMessages([])}
        >
          Clear conversation
        </Button>
      </div>
    </div>
  );
}
