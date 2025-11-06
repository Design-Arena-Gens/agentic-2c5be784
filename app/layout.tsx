import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'n8n YouTube Automation',
  description: 'YouTube end-to-end automation workflow for n8n',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
