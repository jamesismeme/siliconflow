import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils/cn'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SiliconFlow Platform',
  description: '在线大模型调用工具平台',
  keywords: ['AI', '大模型', 'SiliconFlow', '在线工具'],
  authors: [{ name: 'SiliconFlow Platform Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#667eea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-black text-white antialiased")}>
        <div className="relative flex min-h-screen flex-col bg-black">
          <main className="flex-1 bg-black">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
