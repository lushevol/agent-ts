import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [AgentModule],
  controllers: [AppController]
})
export class AppModule {}
