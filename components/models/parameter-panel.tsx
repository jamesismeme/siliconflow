'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  RotateCcw,
  Info,
  Zap
} from 'lucide-react'

// 参数配置接口
interface ModelParameters {
  temperature?: number
  max_tokens?: number
  top_p?: number
  n?: number
  size?: string
  response_format?: string
  voice?: string
  speed?: number
  language?: string
}

interface ModelConfig {
  id: string
  name: string
  displayName: string
  category: 'chat' | 'embedding' | 'rerank' | 'audio' | 'image' | 'code'
  description: string
  features: string[]
  limits: {
    rpm: number
    tpm?: number
    ipm?: number
    ipd?: number
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

interface ParameterPanelProps {
  model: ModelConfig | null
  parameters: ModelParameters
  onParametersChange: (parameters: ModelParameters) => void
  disabled?: boolean
}

// Label 组件
const LabelComponent = ({ children, ...props }: any) => (
  <label className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
    {children}
  </label>
)

// Slider 组件
const SliderComponent = ({ value, onValueChange, min, max, step, disabled, ...props }: any) => (
  <div className="relative flex w-full touch-none select-none items-center">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      disabled={disabled}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-dark"
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
      }}
      {...props}
    />
    <style jsx>{`
      .slider-dark::-webkit-slider-thumb {
        appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #1f2937;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      .slider-dark::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #1f2937;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    `}</style>
  </div>
)

// Textarea 组件
const TextareaComponent = ({ className, ...props }: any) => (
  <textarea
    className="flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
)

export function ParameterPanel({ 
  model, 
  parameters, 
  onParametersChange, 
  disabled = false 
}: ParameterPanelProps) {
  const [localParams, setLocalParams] = useState<ModelParameters>(parameters)

  // 同步外部参数变化
  useEffect(() => {
    setLocalParams(parameters)
  }, [parameters])

  // 参数变化处理
  const handleParameterChange = (key: keyof ModelParameters, value: any) => {
    const newParams = { ...localParams, [key]: value }
    setLocalParams(newParams)
    onParametersChange(newParams)
  }

  // 重置为默认值
  const resetToDefaults = () => {
    if (!model) return

    const defaults: ModelParameters = {}
    
    if (model.parameters.temperature) {
      defaults.temperature = model.parameters.temperature.default
    }
    if (model.parameters.max_tokens) {
      defaults.max_tokens = model.parameters.max_tokens.default
    }
    if (model.parameters.top_p) {
      defaults.top_p = model.parameters.top_p.default
    }

    // 根据模型类别设置默认值
    switch (model.category) {
      case 'image':
        defaults.n = 1
        defaults.size = '1024x1024'
        defaults.response_format = 'url'
        break
      case 'audio':
        defaults.response_format = 'json'
        defaults.language = 'auto'
        break
    }

    setLocalParams(defaults)
    onParametersChange(defaults)
  }

  if (!model) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-1 rounded bg-purple-500/10">
              <Settings className="h-4 w-4 text-purple-400" />
            </div>
            参数配置
          </CardTitle>
          <CardDescription className="text-gray-400">
            请先选择一个模型
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p>选择模型后可配置调用参数</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-1 rounded bg-purple-500/10">
                <Settings className="h-4 w-4 text-purple-400" />
              </div>
              参数配置
            </CardTitle>
            <CardDescription className="text-gray-400">
              调整 {model.name} 的调用参数
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={disabled}
            className="h-9"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="button-text">重置</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 通用参数 */}
        {model.parameters.temperature && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <LabelComponent>温度值 (Temperature)</LabelComponent>
              <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                {localParams.temperature?.toFixed(2) || model.parameters.temperature.default}
              </Badge>
            </div>
            <SliderComponent
              value={localParams.temperature || model.parameters.temperature.default}
              onValueChange={(value: number[]) => handleParameterChange('temperature', value[0])}
              min={model.parameters.temperature.min}
              max={model.parameters.temperature.max}
              step={0.01}
              disabled={disabled}
            />
            <p className="text-xs text-gray-500">
              控制输出的随机性。较低的值使输出更确定，较高的值使输出更随机。
            </p>
          </div>
        )}

        {model.parameters.max_tokens && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <LabelComponent>最大Token数</LabelComponent>
              <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                {localParams.max_tokens || model.parameters.max_tokens.default}
              </Badge>
            </div>
            <SliderComponent
              value={localParams.max_tokens || model.parameters.max_tokens.default}
              onValueChange={(value: number[]) => handleParameterChange('max_tokens', value[0])}
              min={model.parameters.max_tokens.min}
              max={model.parameters.max_tokens.max}
              step={1}
              disabled={disabled}
            />
            <p className="text-xs text-gray-500">
              生成的最大token数量。较大的值允许更长的输出。
            </p>
          </div>
        )}

        {model.parameters.top_p && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <LabelComponent>Top P</LabelComponent>
              <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                {localParams.top_p?.toFixed(2) || model.parameters.top_p.default}
              </Badge>
            </div>
            <SliderComponent
              value={localParams.top_p || model.parameters.top_p.default}
              onValueChange={(value: number[]) => handleParameterChange('top_p', value[0])}
              min={model.parameters.top_p.min}
              max={model.parameters.top_p.max}
              step={0.01}
              disabled={disabled}
            />
            <p className="text-xs text-gray-500">
              核心采样参数。控制考虑的token概率质量。
            </p>
          </div>
        )}

        {/* 图像生成参数 */}
        {model.category === 'image' && (
          <>
            <div className="space-y-2">
              <LabelComponent>图片数量</LabelComponent>
              <Input
                type="number"
                min={1}
                max={4}
                value={localParams.n || 1}
                onChange={(e) => handleParameterChange('n', parseInt(e.target.value))}
                disabled={disabled}
                className="bg-gray-800 border-gray-700 text-white focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <LabelComponent>图片尺寸</LabelComponent>
              <Select
                value={localParams.size || '1024x1024'}
                onValueChange={(value) => handleParameterChange('size', value)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="256x256" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">256x256</SelectItem>
                  <SelectItem value="512x512" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">512x512</SelectItem>
                  <SelectItem value="1024x1024" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">1024x1024</SelectItem>
                  <SelectItem value="1792x1024" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">1792x1024</SelectItem>
                  <SelectItem value="1024x1792" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">1024x1792</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <LabelComponent>响应格式</LabelComponent>
              <Select
                value={localParams.response_format || 'url'}
                onValueChange={(value) => handleParameterChange('response_format', value)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="url" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">URL链接</SelectItem>
                  <SelectItem value="b64_json" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">Base64编码</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* 语音参数 */}
        {model.category === 'audio' && (
          <>
            <div className="space-y-2">
              <LabelComponent>语言</LabelComponent>
              <Select
                value={localParams.language || 'auto'}
                onValueChange={(value) => handleParameterChange('language', value)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="auto" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">自动检测</SelectItem>
                  <SelectItem value="zh" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">中文</SelectItem>
                  <SelectItem value="en" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">英文</SelectItem>
                  <SelectItem value="ja" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">日文</SelectItem>
                  <SelectItem value="ko" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">韩文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <LabelComponent>响应格式</LabelComponent>
              <Select
                value={localParams.response_format || 'json'}
                onValueChange={(value) => handleParameterChange('response_format', value)}
                disabled={disabled}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="json" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">JSON</SelectItem>
                  <SelectItem value="text" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">纯文本</SelectItem>
                  <SelectItem value="srt" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">SRT字幕</SelectItem>
                  <SelectItem value="vtt" className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">VTT字幕</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* 参数预设 */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded bg-yellow-500/10">
              <Zap className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-sm font-medium text-white">快速预设</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const creative = { ...localParams }
                if (model.parameters.temperature) creative.temperature = 0.9
                if (model.parameters.top_p) creative.top_p = 0.95
                setLocalParams(creative)
                onParametersChange(creative)
              }}
              disabled={disabled}
              className="h-9"
            >
              <span className="button-text">创意模式</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const balanced = { ...localParams }
                if (model.parameters.temperature) balanced.temperature = 0.7
                if (model.parameters.top_p) balanced.top_p = 0.9
                setLocalParams(balanced)
                onParametersChange(balanced)
              }}
              disabled={disabled}
              className="h-9"
            >
              <span className="button-text">平衡模式</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const precise = { ...localParams }
                if (model.parameters.temperature) precise.temperature = 0.3
                if (model.parameters.top_p) precise.top_p = 0.8
                setLocalParams(precise)
                onParametersChange(precise)
              }}
              disabled={disabled}
              className="h-9"
            >
              <span className="button-text">精确模式</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const deterministic = { ...localParams }
                if (model.parameters.temperature) deterministic.temperature = 0.1
                if (model.parameters.top_p) deterministic.top_p = 0.7
                setLocalParams(deterministic)
                onParametersChange(deterministic)
              }}
              disabled={disabled}
              className="h-9"
            >
              <span className="button-text">确定模式</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
