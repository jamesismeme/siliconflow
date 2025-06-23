import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置',
      SILICONFLOW_BASE_URL: process.env.SILICONFLOW_BASE_URL ? '✅ 已设置' : '❌ 未设置',
      SILICONFLOW_TOKENS: process.env.SILICONFLOW_TOKENS ? '✅ 已设置' : '❌ 未设置',
    }

    const allSet = Object.values(envVars).every(status => status.includes('✅'))

    return NextResponse.json({
      success: allSet,
      message: allSet ? '所有环境变量已正确配置' : '部分环境变量缺失',
      envVars,
      databaseUrlPreview: process.env.DATABASE_URL ? 
        `${process.env.DATABASE_URL.substring(0, 20)}...` : 
        '未设置'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '检查环境变量时出错',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
