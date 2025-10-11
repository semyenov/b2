import { Box, useStdout } from 'ink'
import React from 'react'

interface FullScreenLayoutProps {
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}

export function FullScreenLayout({ header, children, footer }: FullScreenLayoutProps) {
  const { stdout } = useStdout()
  const terminalHeight = stdout.rows || 24
  const terminalWidth = stdout.columns || 80

  return (
    <Box flexDirection="column" height={terminalHeight} width={terminalWidth}>
      {/* Header section */}
      {header && (
        <Box flexDirection="column" width="100%">
          {header}
        </Box>
      )}

      {/* Main content - takes remaining space */}
      <Box flexDirection="column" flexGrow={1} width="100%">
        {children}
      </Box>

      {/* Footer section - stuck to bottom */}
      {footer && (
        <Box flexDirection="column" width="100%">
          {footer}
        </Box>
      )}
    </Box>
  )
}
