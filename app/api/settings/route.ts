import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// 默认设置
const DEFAULT_SETTINGS = {
  baseUrl: 'https://api.siliconflow.cn/v1',
  chatModel: 'Qwen/Qwen3-8B',
  imageModel: 'Kwai-Kolors/Kolors',
  audioModel: 'FunAudioLLM/SenseVoiceSmall',
  textModel: 'BAAI/bge-m3'
}

// 确保数据目录存在
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// 读取设置
async function readSettings() {
  try {
    await ensureDataDir()
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
  } catch (error) {
    // 如果文件不存在，返回默认设置
    return DEFAULT_SETTINGS
  }
}

// 写入设置
async function writeSettings(settings: any) {
  try {
    await ensureDataDir()
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error('写入设置失败:', error)
    return false
  }
}

// 获取设置
export async function GET() {
  try {
    const settings = await readSettings()
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('[Settings API] Get Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 保存设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证必要字段
    const requiredFields = ['baseUrl', 'chatModel', 'imageModel', 'audioModel', 'textModel']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`
          },
          { status: 400 }
        )
      }
    }

    // 读取现有设置并合并
    const currentSettings = await readSettings()
    const newSettings = { ...currentSettings, ...body }

    // 保存设置
    const success = await writeSettings(newSettings)
    
    if (success) {
      return NextResponse.json({
        success: true,
        data: newSettings,
        message: 'Settings saved successfully'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save settings' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[Settings API] Save Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 重置设置
export async function DELETE() {
  try {
    const success = await writeSettings(DEFAULT_SETTINGS)
    
    if (success) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_SETTINGS,
        message: 'Settings reset to default'
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to reset settings' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[Settings API] Reset Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
