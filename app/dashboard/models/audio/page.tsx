'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModelSelector } from '@/components/models/model-selector'
import { ParameterPanel } from '@/components/models/parameter-panel'
import {
  Mic,
  Upload,
  Play,
  Pause,
  Download,
  Copy,
  Settings,
  Loader2,
  FileAudio,
  Volume2,
  Trash2,
  RotateCcw,
  Info
} from 'lucide-react'
import { useAudioApi } from '@/lib/hooks/use-api'
import { useModelStore } from '@/lib/stores/model-store'
import { toast } from 'sonner'

// 音频处理历史记录
interface AudioRecord {
  id: string
  type: 'transcription' | 'speech'
  input: string // 文件名或文本
  output: string // 转录文本或音频URL
  parameters: any
  timestamp: string
}

export default function AudioProcessingPage() {
  const [activeTab, setActiveTab] = useState<'transcription'>('transcription')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [processingFile, setProcessingFile] = useState<File | null>(null)

  const [audioRecords, setAudioRecords] = useState<AudioRecord[]>([])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showParameters, setShowParameters] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { transcribe, loading, error } = useAudioApi()
  const {
    selectedModel,
    setSelectedModel,
    parameters,
    setParameters,
    updateParameter,
    selectDefaultModel,
    forceSelectDefaultModel
  } = useModelStore()

  // 确保使用正确的语音模型
  useEffect(() => {
    // 如果没有模型或者当前模型不是语音类型，强制选择默认语音模型
    if (!selectedModel || selectedModel.category !== 'audio') {
      forceSelectDefaultModel('audio')
    }
  }, [selectedModel, forceSelectDefaultModel])

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型 - 使用正确的MIME类型和文件扩展名
      const allowedTypes = [
        // MP3 格式
        'audio/mpeg',
        'audio/mp3',
        'audio/mpeg3',
        'audio/x-mpeg-3',

        // WAV 格式
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/vnd.wave',

        // M4A 格式
        'audio/m4a',
        'audio/mp4',
        'audio/x-m4a',
        'audio/aac',

        // FLAC 格式
        'audio/flac',
        'audio/x-flac',

        // 其他可能的格式
        'audio/ogg',      // OGG (如果支持)
        'audio/webm',     // WebM (如果支持)
        ''                // 某些系统可能返回空字符串
      ]

      // 同时检查文件扩展名作为主要验证方式
      const fileName = file.name.toLowerCase()
      const allowedExtensions = ['.mp3', '.wav', '.m4a', '.flac']
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

      // 获取文件扩展名
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

      // 优先使用文件扩展名验证，MIME类型作为辅助
      const isValidFile = hasValidExtension || allowedTypes.includes(file.type)

      if (!isValidFile) {
        alert(`请上传支持的音频格式：MP3, WAV, M4A, FLAC\n\n文件信息：\n文件名：${file.name}\n文件类型：${file.type || '未知'}\n文件扩展名：${fileExtension}\n\n请确保文件是有效的音频文件。`)
        return
      }

      // 检查文件大小 (25MB限制)
      if (file.size > 25 * 1024 * 1024) {
        alert('文件大小不能超过25MB')
        return
      }

      console.log('文件上传成功:', {
        name: file.name,
        type: file.type || '未知类型',
        extension: fileExtension,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        validExtension: hasValidExtension,
        validMimeType: allowedTypes.includes(file.type)
      })

      setAudioFile(file)
    }
  }

  // 语音转文字
  const handleTranscription = async () => {
    if (!audioFile || !selectedModel || loading) return

    const currentFile = audioFile
    setProcessingFile(currentFile)
    toast.info(`开始转录音频文件：${currentFile.name}`)

    try {
      const result = await transcribe(selectedModel.name, currentFile, parameters)

      if (result.success && result.data?.text) {
        const newRecord: AudioRecord = {
          id: `${Date.now()}`,
          type: 'transcription',
          input: currentFile.name,
          output: result.data.text,
          parameters: { ...parameters },
          timestamp: new Date().toISOString()
        }

        setAudioRecords(prev => [newRecord, ...prev])
        setAudioFile(null)
        setProcessingFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        toast.success('音频转录完成！')
      } else {
        setProcessingFile(null)
        toast.error('音频转录失败，请重试')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      setProcessingFile(null)
      toast.error('音频转录出错，请检查文件格式')
    }
  }



  // 复制文本
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('转录文本已复制到剪贴板')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('复制失败')
    }
  }

  // 下载转录结果为Markdown
  const downloadTranscription = (record: AudioRecord) => {
    const markdown = record.output

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `转录结果_${record.input.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('转录文本已下载')
  }

  // 删除记录
  const deleteRecord = (id: string) => {
    setAudioRecords(prev => prev.filter(record => record.id !== id))
    toast.info('已删除转录记录')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 背景装饰 */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* 页面标题 */}
        <div>
          <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 mb-4">
            <Volume2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">AI语音处理</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              语音处理
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            语音转文字，支持多种语言和音频格式，比Whisper快15倍，体验最先进的语音识别技术
          </p>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：处理控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 模型选择 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">选择模型</CardTitle>
                  <CardDescription className="text-sm text-gray-400">
                    {selectedModel ? selectedModel.displayName : '请选择语音处理模型'}
                  </CardDescription>
                </div>
                {selectedModel?.recommended && (
                  <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">推荐</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowParameters(!showParameters)}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="button-text">参数</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModelSelector(true)}
                  className="flex-1"
                >
                  <span className="button-text">选择模型</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 功能选择 */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base text-white">处理功能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="h-5 w-5 text-blue-400" />
                  <h3 className="font-medium text-white">语音转文字</h3>
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">SenseVoice</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">上传音频文件</Label>
                    <div className="mt-2">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".mp3,.wav,.m4a,.flac,audio/mpeg,audio/wav,audio/m4a,audio/flac"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      支持 MP3, WAV, M4A, FLAC 格式，最大25MB
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-300">支持的具体格式</summary>
                        <div className="mt-1 pl-2 border-l-2 border-gray-600">
                          <p className="text-gray-400">• <strong className="text-gray-300">MP3</strong>: .mp3 (MPEG Audio Layer 3)</p>
                          <p className="text-gray-400">• <strong className="text-gray-300">WAV</strong>: .wav (Waveform Audio File)</p>
                          <p className="text-gray-400">• <strong className="text-gray-300">M4A</strong>: .m4a (MPEG-4 Audio)</p>
                          <p className="text-gray-400">• <strong className="text-gray-300">FLAC</strong>: .flac (Free Lossless Audio Codec)</p>
                        </div>
                      </details>
                    </div>
                  </div>

                  {audioFile && (
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2">
                        <FileAudio className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{audioFile.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        大小: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  {/* 处理中的状态显示 */}
                  {processingFile && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">正在转录音频...</span>
                      </div>
                      <p className="text-xs text-blue-400 mt-1">
                        文件: {processingFile.name}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="text-xs text-blue-400 ml-2">AI正在分析音频内容</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleTranscription}
                    disabled={!audioFile || !selectedModel || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        转录中...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        开始转录
                      </>
                    )}
                  </Button>

                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">功能说明</span>
                    </div>
                    <ul className="text-xs text-blue-400 space-y-1">
                      <li>• 支持多语言自动识别（中文、英文、日文、韩文等）</li>
                      <li>• 比Whisper快15倍，延迟更低</li>
                      <li>• 支持情绪识别和说话人识别</li>
                      <li>• 可输出JSON、文本、SRT、VTT等格式</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* 参数配置 */}
          {showParameters && selectedModel && (
            <ParameterPanel
              model={selectedModel}
              parameters={parameters}
              onParametersChange={setParameters}
              disabled={loading}
            />
          )}
        </div>

        {/* 右侧：处理结果展示 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-blue-400" />
                    处理结果
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {audioRecords.length > 0
                      ? `共处理了 ${audioRecords.length} 个音频`
                      : '处理结果将在这里显示'
                    }
                  </CardDescription>
                </div>
                {audioRecords.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAudioRecords([])
                      toast.info('已清空所有转录记录')
                    }}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="button-text">清空</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {audioRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>还没有处理记录</p>
                  <p className="text-sm">上传音频文件开始语音转文字</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {audioRecords.map((record) => (
                    <div key={record.id} className="border border-gray-700 bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-blue-400" />
                          <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">语音转文字</Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(record.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecord(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-300">输入</Label>
                          <p className="text-sm bg-gray-700/50 text-gray-300 p-2 rounded mt-1">
                            {record.input}
                          </p>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-300">转录结果</Label>
                          <div className="bg-gray-700/50 p-2 rounded mt-1">
                            <p className="text-sm whitespace-pre-wrap text-gray-300">{record.output}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyText(record.output)}
                                className="h-6"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                <span className="button-text">复制</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadTranscription(record)}
                                className="h-6"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                <span className="button-text">下载</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>



      {/* 模型选择器弹窗 */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-400" />
                  选择语音处理模型
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowModelSelector(false)}
                >
                  <span className="button-text">关闭</span>
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <ModelSelector
                selectedModel={selectedModel}
                onModelSelect={(model) => {
                  setSelectedModel(model)
                  setShowModelSelector(false)
                }}
                category="audio"
                showRecommendedOnly={false}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
