import { AUTO_MODEL, type TaskType } from './types';

const MODEL_LABELS: Record<string, string> = {
  [AUTO_MODEL]: 'Auto (best model for the task)',
  'openrouter/free': 'OpenRouter Free Router',
  'google/gemma-4-31b-it:free': 'Gemma 4 31B IT',
  'google/gemma-4-26b-a4b-it:free': 'Gemma 4 26B IT',
  'nvidia/nemotron-3-nano-30b-a3b:free': 'Nemotron 3 Nano 30B',
  'nvidia/nemotron-3-super-120b-a12b:free': 'Nemotron 3 Super 120B',
  'nvidia/nemotron-3-ultra-550b-a55b:free': 'Nemotron 3 Ultra 550B',
  'nvidia/nemotron-3.5-lightning:free': 'Nemotron 3.5 Lightning',
  'nvidia/nemotron-3.5-super-vl:free': 'Nemotron 3.5 Super VL',
  'openai/gpt-oss-20b:free': 'GPT OSS 20B',
  'poolside/laguna-xs-2.1:free': 'Laguna XS 2.1',
  'poolside/laguna-s-2.1:free': 'Laguna S 2.1',
  'cohere/north-mini-code:free': 'Cohere North Mini Code',
  'qwen/qwen3-coder:free': 'Qwen3 Coder',
  'z-ai/glm-5.2:free': 'GLM 5.2',
  'dots-studio/dots-3-note-preview:free': 'dots.3 Note',
  'particle-ai/particle-1:free': 'Particle 1',
  'inclusionai/ling-3.2-flash:free': 'Ling 3.2 Flash',
  'baidu/ernie-5.5-flash-preview:free': 'ERNIE 5.5 Flash',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gemini-flash-lite-latest': 'Gemini Flash Lite',
  'gemini-flash-latest': 'Gemini Flash',
  'gemini-3.5-flash-lite': 'Gemini 3.5 Flash Lite',
};

export function getModelLabel(modelId: string): string {
  return MODEL_LABELS[modelId] || modelId.split('/')[1]?.replace(':free', '') || modelId.replace(':free', '');
}

export const TASK_LABELS: Record<TaskType, string> = {
  vision: 'image analysis',
  code: 'coding',
  reasoning: 'reasoning',
  document: 'document Q&A',
  writing: 'writing',
  quick: 'quick answer',
  general: 'general chat',
};

export function isTaskType(value: string | null): value is TaskType {
  return value !== null && value in TASK_LABELS;
}
