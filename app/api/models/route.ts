import { NextRequest, NextResponse } from 'next/server'
import { ALL_MODELS, getModelsByCategory, getRecommendedModels, MODEL_CATEGORIES } from '@/lib/constants/models'

export const runtime = 'nodejs'

// 获取模型列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const recommended = searchParams.get('recommended')

    let models = ALL_MODELS

    // 按类别筛选
    if (category && category !== 'all') {
      models = getModelsByCategory(category as any)
    }

    // 在已筛选的模型中只返回推荐模型
    if (recommended === 'true') {
      models = models.filter(model => model.recommended)
    }

    return NextResponse.json({
      success: true,
      data: {
        models,
        categories: MODEL_CATEGORIES,
        total: models.length,
        recommended: models.filter(m => m.recommended).length
      }
    })
  } catch (error) {
    console.error('[API] Failed to get models:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
