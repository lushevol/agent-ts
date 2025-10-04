import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AgentModule } from './agent/agent.module';
import { ReviewAgentModule } from './review-agent/review-agent.module';

@Module({
  imports: [AgentModule, ReviewAgentModule],
  controllers: [AppController]
})
export class AppModule {}
