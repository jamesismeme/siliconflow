// 模型配置和元数据
export interface ModelConfig {
  id: string
  name: string
  displayName: string
  category: 'chat' | 'embedding' | 'rerank' | 'audio' | 'image' | 'code'
  description: string
  features: string[]
  limits: {
    rpm: number // Requests Per Minute
    tpm?: number // Tokens Per Minute
    ipm?: number // Images Per Minute
    ipd?: number // Images Per Day
  }
  parameters: {
    temperature?: { min: number; max: number; default: number }
    max_tokens?: { min: number; max: number; default: number }
    top_p?: { min: number; max: number; default: number }
  }
  recommended: boolean
  contextLength: number
  pricing: 'free' | 'paid'
}

// 推荐模型配置
export const RECOMMENDED_MODELS: ModelConfig[] = [
  {
    id: 'qwen3-8b',
    name: 'Qwen/Qwen3-8B',
    displayName: 'Qwen3-8B',
    category: 'chat',
    description: '支持思考模式，推理、代码、数学能力强，多语言支持丰富',
    features: ['多语言', '代码生成', '数学推理', '思考模式'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: true,
    contextLength: 128000,
    pricing: 'free'
  },
  {
    id: 'deepseek-r1',
    name: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
    displayName: 'DeepSeek-R1',
    category: 'chat',
    description: '数学推理能力突出，适合复杂计算和编程推理',
    features: ['数学推理', '逻辑推理', '编程辅助'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: true,
    contextLength: 128000,
    pricing: 'free'
  },
  {
    id: 'qwen-coder',
    name: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    displayName: 'Qwen2.5-Coder',
    category: 'chat',
    description: '专注代码生成与修复，开发效率神器',
    features: ['代码生成', '代码修复', '多语言编程'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.3 },
      max_tokens: { min: 1, max: 4096, default: 2048 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: true,
    contextLength: 32000,
    pricing: 'free'
  },
  {
    id: 'bge-m3',
    name: 'BAAI/bge-m3',
    displayName: 'BGE-M3',
    category: 'embedding',
    description: '多语言支持，适合语义搜索和匹配',
    features: ['多语言', '语义检索', '向量生成'],
    limits: { rpm: 2000, tpm: 500000 },
    parameters: {},
    recommended: true,
    contextLength: 8192,
    pricing: 'free'
  },
  {
    id: 'bge-reranker-m3',
    name: 'BAAI/bge-reranker-v2-m3',
    displayName: 'BGE-Reranker-M3',
    category: 'rerank',
    description: '轻量级，多语言支持，直接输出相似度分数',
    features: ['多语言', '重排序', '相似度计算'],
    limits: { rpm: 2000, tpm: 500000 },
    parameters: {},
    recommended: true,
    contextLength: 8192,
    pricing: 'free'
  },
  {
    id: 'sensevoice',
    name: 'FunAudioLLM/SenseVoiceSmall',
    displayName: 'SenseVoice',
    category: 'audio',
    description: '多语言ASR，速度比Whisper快15倍',
    features: ['多语言', '情感识别', '高速处理'],
    limits: { rpm: 0 }, // 暂不限制
    parameters: {},
    recommended: true,
    contextLength: 0,
    pricing: 'free'
  },
  {
    id: 'kolors',
    name: 'Kwai-Kolors/Kolors',
    displayName: 'Kolors',
    category: 'image',
    description: '中文内容渲染优秀，适合创意图像生成',
    features: ['中英文支持', '图生图', '创意设计'],
    limits: { rpm: 0, ipm: 2, ipd: 400 },
    parameters: {},
    recommended: true,
    contextLength: 0,
    pricing: 'free'
  }
]

// 所有可用模型
export const ALL_MODELS: ModelConfig[] = [
  ...RECOMMENDED_MODELS,
  // 其他对话模型
  {
    id: 'glm-z1-9b',
    name: 'THUDM/GLM-Z1-9B-0414',
    displayName: 'GLM-Z1-9B',
    category: 'chat',
    description: '小参数高性能，适合轻量级部署，数学推理能力突出',
    features: ['轻量级', '数学推理', '高效部署'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 128000,
    pricing: 'free'
  },
  {
    id: 'glm-4-9b',
    name: 'THUDM/GLM-4-9B-0414',
    displayName: 'GLM-4-9B',
    category: 'chat',
    description: '支持函数调用、SVG生成，代码生成能力强',
    features: ['函数调用', 'SVG生成', '代码生成'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 32000,
    pricing: 'free'
  },
  {
    id: 'deepseek-r1-distill',
    name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    displayName: 'DeepSeek-R1-Distill',
    category: 'chat',
    description: 'DeepSeek-R1的蒸馏版本，保持高性能的同时提升速度',
    features: ['快速推理', '高效对话', '知识蒸馏'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 128000,
    pricing: 'free'
  },
  {
    id: 'qwen2-5-7b',
    name: 'Qwen/Qwen2.5-7B-Instruct',
    displayName: 'Qwen2.5-7B',
    category: 'chat',
    description: 'Qwen2.5系列指令微调模型',
    features: ['指令遵循', '对话生成', '文本理解'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 32000,
    pricing: 'free'
  },
  {
    id: 'internlm2-5',
    name: 'internlm/internlm2_5-7b-chat',
    displayName: 'InternLM2.5-7B',
    category: 'chat',
    description: '上海AI实验室开源的高性能对话模型',
    features: ['对话生成', '知识问答', '多语言支持'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 32000,
    pricing: 'free'
  },
  {
    id: 'qwen2-7b',
    name: 'Qwen/Qwen2-7B-Instruct',
    displayName: 'Qwen2-7B',
    category: 'chat',
    description: 'Qwen2系列指令微调模型',
    features: ['指令遵循', '对话生成', '文本理解'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 32000,
    pricing: 'free'
  },
  {
    id: 'glm-4-9b-chat',
    name: 'THUDM/glm-4-9b-chat',
    displayName: 'GLM-4-9B-Chat',
    category: 'chat',
    description: 'GLM-4系列对话优化版本',
    features: ['对话优化', '上下文理解', '多轮对话'],
    limits: { rpm: 1000, tpm: 50000 },
    parameters: {
      temperature: { min: 0, max: 2, default: 0.7 },
      max_tokens: { min: 1, max: 4096, default: 1024 },
      top_p: { min: 0, max: 1, default: 0.9 }
    },
    recommended: false,
    contextLength: 128000,
    pricing: 'free'
  },
  // 其他嵌入模型
  {
    id: 'bge-large-zh',
    name: 'BAAI/bge-large-zh-v1.5',
    displayName: 'BGE-Large-ZH',
    category: 'embedding',
    description: '中文语义检索领先，C-MTEB 平均分 64.53',
    features: ['中文专用', '语义检索', '高精度'],
    limits: { rpm: 2000, tpm: 500000 },
    parameters: {},
    recommended: false,
    contextLength: 512,
    pricing: 'free'
  },
  {
    id: 'bge-large-en',
    name: 'BAAI/bge-large-en-v1.5',
    displayName: 'BGE-Large-EN',
    category: 'embedding',
    description: '英文语义检索专用，MTEB 平均分 64.23',
    features: ['英文专用', '语义检索', '高精度'],
    limits: { rpm: 2000, tpm: 500000 },
    parameters: {},
    recommended: false,
    contextLength: 512,
    pricing: 'free'
  },
  {
    id: 'bce-embedding',
    name: 'netease-youdao/bce-embedding-base_v1',
    displayName: 'BCE-Embedding',
    category: 'embedding',
    description: '网易有道开源的文本嵌入模型',
    features: ['中英文支持', '语义嵌入', '检索优化'],
    limits: { rpm: 2000, tpm: 500000 },
    parameters: {},
    recommended: false,
    contextLength: 512,
    pricing: 'free'
  },
  // 其他重排序模型
  {
    id: 'bce-reranker',
    name: 'netease-youdao/bce-reranker-base_v1',
    displayName: 'BCE-Reranker',
    category: 'rerank',
    description: '网易有道开源的文本重排序模型',
    features: ['重排序', '检索优化', '相关性评分'],
    limits: { rpm: 2000, tpm: 500000 },
    parameters: {},
    recommended: false,
    contextLength: 512,
    pricing: 'free'
  }
]

// 按类别获取模型
export function getModelsByCategory(category: ModelConfig['category']): ModelConfig[] {
  return ALL_MODELS.filter(model => model.category === category)
}

// 获取推荐模型
export function getRecommendedModels(): ModelConfig[] {
  return ALL_MODELS.filter(model => model.recommended)
}

// 根据ID获取模型
export function getModelById(id: string): ModelConfig | undefined {
  return ALL_MODELS.find(model => model.id === id)
}

// 根据名称获取模型
export function getModelByName(name: string): ModelConfig | undefined {
  return ALL_MODELS.find(model => model.name === name)
}

// 获取每个类别的默认推荐模型（第一个推荐模型）
export function getDefaultModelByCategory(category: ModelConfig['category']): ModelConfig | undefined {
  const categoryModels = getModelsByCategory(category)
  return categoryModels.find(model => model.recommended)
}

// 获取所有类别的默认模型映射
export function getDefaultModels(): Record<ModelConfig['category'], ModelConfig | undefined> {
  return {
    chat: getDefaultModelByCategory('chat'),
    code: getDefaultModelByCategory('code'),
    embedding: getDefaultModelByCategory('embedding'),
    rerank: getDefaultModelByCategory('rerank'),
    audio: getDefaultModelByCategory('audio'),
    image: getDefaultModelByCategory('image')
  }
}

// 模型类别信息
export const MODEL_CATEGORIES = {
  chat: {
    name: '对话模型',
    description: '支持多轮对话、问答、创作等任务',
    icon: 'MessageSquare'
  },
  code: {
    name: '代码模型',
    description: '专注代码生成、修复和解释',
    icon: 'Code'
  },
  embedding: {
    name: '嵌入模型',
    description: '文本向量化，用于语义搜索和相似度计算',
    icon: 'FileText'
  },
  rerank: {
    name: '重排序模型',
    description: '优化搜索结果排序，提升检索准确性',
    icon: 'ArrowUpDown'
  },
  audio: {
    name: '语音模型',
    description: '语音识别、合成和处理',
    icon: 'Mic'
  },
  image: {
    name: '图像模型',
    description: '图像生成、编辑和理解',
    icon: 'Image'
  }
} as const
