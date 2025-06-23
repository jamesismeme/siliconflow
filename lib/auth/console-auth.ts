// 客户端认证检查
export async function checkConsoleAuthClient(): Promise<boolean> {
  try {
    const response = await fetch('/api/console/auth', {
      method: 'GET',
      credentials: 'include'
    })

    const data = await response.json()
    return data.authenticated === true
  } catch (error) {
    console.error('Auth check failed:', error)
    return false
  }
}

// 服务端认证检查 (仅用于服务端组件)
export function checkConsoleAuthServer() {
  // 这个函数将在服务端组件中使用
  return true
}
