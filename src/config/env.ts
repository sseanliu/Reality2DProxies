interface EnvConfig {
  OPENAI_API_KEY: string;
}

export const env: EnvConfig = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
};