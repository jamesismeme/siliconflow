/**
 * LocalStorage 管理系统测试文件
 * 用于验证存储功能是否正常工作
 */

import { getStorageManager, getTokenManager, validateToken } from './index'
import type { Token, UserSettings, CallHistory } from './types'

/**
 * 测试 Token 管理功能
 */
export function testTokenManagement(): boolean {
  console.log('🧪 测试 Token 管理功能...')
  
  try {
    const tokenManager = getTokenManager()
    
    // 清空现有数据
    const storage = getStorageManager()
    storage.clearAllData()
    
    // 测试添加 Token
    const testToken = {
      name: '测试 Token',
      value: 'sk-test1234567890abcdefghijklmnopqrstuvwxyz',
      limitPerDay: 1000
    }
    
    const addResult = tokenManager.addToken(testToken)
    if (!addResult.success) {
      console.error('❌ 添加 Token 失败:', addResult.error)
      return false
    }
    
    console.log('✅ Token 添加成功')
    
    // 测试获取 Token
    const tokens = tokenManager.getTokens()
    if (tokens.length !== 1) {
      console.error('❌ Token 数量不正确')
      return false
    }
    
    console.log('✅ Token 获取成功')
    
    // 测试更新 Token
    const tokenId = tokens[0].id
    const updateResult = tokenManager.updateToken(tokenId, { name: '更新后的 Token' })
    if (!updateResult.success) {
      console.error('❌ 更新 Token 失败:', updateResult.error)
      return false
    }
    
    console.log('✅ Token 更新成功')
    
    // 测试记录使用
    tokenManager.recordUsage(tokenId)
    const updatedTokens = tokenManager.getTokens()
    if (updatedTokens[0].usageToday !== 1) {
      console.error('❌ 使用记录失败')
      return false
    }
    
    console.log('✅ 使用记录成功')
    
    // 测试获取统计
    const stats = tokenManager.getStats()
    if (stats.totalTokens !== 1 || stats.activeTokens !== 1) {
      console.error('❌ 统计信息不正确')
      return false
    }
    
    console.log('✅ 统计信息正确')
    
    // 测试删除 Token
    const removeResult = tokenManager.removeToken(tokenId)
    if (!removeResult.success) {
      console.error('❌ 删除 Token 失败:', removeResult.error)
      return false
    }
    
    const finalTokens = tokenManager.getTokens()
    if (finalTokens.length !== 0) {
      console.error('❌ Token 删除失败')
      return false
    }
    
    console.log('✅ Token 删除成功')
    
    return true
  } catch (error) {
    console.error('❌ Token 管理测试失败:', error)
    return false
  }
}

/**
 * 测试 Token 验证功能
 */
export function testTokenValidation(): boolean {
  console.log('🧪 测试 Token 验证功能...')
  
  try {
    // 测试有效 Token
    const validToken = 'sk-test1234567890abcdefghijklmnopqrstuvwxyz'
    const validResult = validateToken(validToken)
    if (!validResult.isValid) {
      console.error('❌ 有效 Token 验证失败:', validResult.error)
      return false
    }
    
    console.log('✅ 有效 Token 验证成功')
    
    // 测试无效 Token（无前缀）
    const invalidToken1 = 'test1234567890abcdefghijklmnopqrstuvwxyz'
    const invalidResult1 = validateToken(invalidToken1)
    if (invalidResult1.isValid) {
      console.error('❌ 无效 Token 验证失败（应该检测到无前缀）')
      return false
    }
    
    console.log('✅ 无前缀 Token 验证成功')
    
    // 测试无效 Token（长度不够）
    const invalidToken2 = 'sk-short'
    const invalidResult2 = validateToken(invalidToken2)
    if (invalidResult2.isValid) {
      console.error('❌ 无效 Token 验证失败（应该检测到长度不够）')
      return false
    }
    
    console.log('✅ 短 Token 验证成功')
    
    return true
  } catch (error) {
    console.error('❌ Token 验证测试失败:', error)
    return false
  }
}

/**
 * 测试用户设置功能
 */
export function testUserSettings(): boolean {
  console.log('🧪 测试用户设置功能...')
  
  try {
    const storage = getStorageManager()
    
    // 测试获取默认设置
    const defaultSettings = storage.getSettings()
    if (!defaultSettings.baseUrl || !defaultSettings.chatModel) {
      console.error('❌ 默认设置不完整')
      return false
    }
    
    console.log('✅ 默认设置获取成功')
    
    // 测试更新设置
    const newSettings: UserSettings = {
      ...defaultSettings,
      chatModel: 'test-model',
      preferences: {
        ...defaultSettings.preferences,
        maxHistoryItems: 100
      }
    }
    
    storage.setSettings(newSettings)
    const updatedSettings = storage.getSettings()
    
    if (updatedSettings.chatModel !== 'test-model' || 
        updatedSettings.preferences.maxHistoryItems !== 100) {
      console.error('❌ 设置更新失败')
      return false
    }
    
    console.log('✅ 设置更新成功')
    
    return true
  } catch (error) {
    console.error('❌ 用户设置测试失败:', error)
    return false
  }
}

/**
 * 测试调用历史功能
 */
export function testCallHistory(): boolean {
  console.log('🧪 测试调用历史功能...')
  
  try {
    const storage = getStorageManager()
    
    // 清空历史
    storage.clearHistory()
    
    // 测试添加历史记录
    const testCall: CallHistory = {
      id: 'test-call-1',
      model: 'test-model',
      type: 'chat',
      parameters: { temperature: 0.7 },
      result: { success: true, data: 'test response' },
      timestamp: new Date().toISOString()
    }
    
    storage.addToHistory(testCall)
    const history = storage.getHistory()
    
    if (history.length !== 1 || history[0].id !== 'test-call-1') {
      console.error('❌ 历史记录添加失败')
      return false
    }
    
    console.log('✅ 历史记录添加成功')
    
    // 测试删除历史记录
    storage.removeFromHistory('test-call-1')
    const updatedHistory = storage.getHistory()
    
    if (updatedHistory.length !== 0) {
      console.error('❌ 历史记录删除失败')
      return false
    }
    
    console.log('✅ 历史记录删除成功')
    
    return true
  } catch (error) {
    console.error('❌ 调用历史测试失败:', error)
    return false
  }
}

/**
 * 测试数据导入导出功能
 */
export function testDataImportExport(): boolean {
  console.log('🧪 测试数据导入导出功能...')
  
  try {
    const storage = getStorageManager()
    const tokenManager = getTokenManager()
    
    // 清空数据
    storage.clearAllData()
    
    // 添加一些测试数据
    tokenManager.addToken({
      name: '导出测试 Token',
      value: 'sk-export1234567890abcdefghijklmnopqrstuvwxyz'
    })
    
    const testCall: CallHistory = {
      id: 'export-test-call',
      model: 'export-test-model',
      type: 'chat',
      parameters: {},
      result: { success: true },
      timestamp: new Date().toISOString()
    }
    storage.addToHistory(testCall)
    
    // 测试导出
    const exportData = storage.exportData()
    if (!exportData) {
      console.error('❌ 数据导出失败')
      return false
    }
    
    console.log('✅ 数据导出成功')
    
    // 清空数据
    storage.clearAllData()
    
    // 测试导入
    const importResult = storage.importData(exportData)
    if (!importResult) {
      console.error('❌ 数据导入失败')
      return false
    }
    
    // 验证导入的数据
    const importedTokens = tokenManager.getTokens()
    const importedHistory = storage.getHistory()
    
    if (importedTokens.length !== 1 || importedHistory.length !== 1) {
      console.error('❌ 导入的数据不完整')
      return false
    }
    
    console.log('✅ 数据导入成功')
    
    return true
  } catch (error) {
    console.error('❌ 数据导入导出测试失败:', error)
    return false
  }
}

/**
 * 运行所有测试
 */
export function runAllTests(): boolean {
  console.log('🚀 开始运行 LocalStorage 管理系统测试...\n')
  
  const tests = [
    { name: 'Token 管理', test: testTokenManagement },
    { name: 'Token 验证', test: testTokenValidation },
    { name: '用户设置', test: testUserSettings },
    { name: '调用历史', test: testCallHistory },
    { name: '数据导入导出', test: testDataImportExport }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const { name, test } of tests) {
    console.log(`\n📋 测试: ${name}`)
    console.log('─'.repeat(50))
    
    try {
      const result = test()
      if (result) {
        console.log(`✅ ${name} 测试通过`)
        passedTests++
      } else {
        console.log(`❌ ${name} 测试失败`)
      }
    } catch (error) {
      console.log(`❌ ${name} 测试异常:`, error)
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！LocalStorage 管理系统工作正常')
    return true
  } else {
    console.log('⚠️  部分测试失败，请检查实现')
    return false
  }
}

// 如果在浏览器环境中直接运行
if (typeof window !== 'undefined') {
  // 将测试函数挂载到 window 对象，方便在控制台调用
  (window as any).testLocalStorage = {
    runAllTests,
    testTokenManagement,
    testTokenValidation,
    testUserSettings,
    testCallHistory,
    testDataImportExport
  }
  
  console.log('💡 提示: 在浏览器控制台中运行 testLocalStorage.runAllTests() 来测试存储系统')
}
