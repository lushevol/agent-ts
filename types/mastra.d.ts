declare module 'mastra' {
  export type MastraConfig = {
    name: string;
    description?: string;
  };

  export class Mastra {
    constructor(config: MastraConfig);
    run?(input: unknown): Promise<{ output: string }>;
  }
}
