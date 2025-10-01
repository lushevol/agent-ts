import { Body, Controller, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

type AgentChatRequest = {
  message: string;
};

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() body: AgentChatRequest) {
    const response = await this.agentService.chat(body.message);

    return {
      message: response.output,
      meta: response.meta
    };
  }
}
