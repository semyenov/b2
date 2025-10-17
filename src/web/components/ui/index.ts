/**
 * UI Primitives - Reusable component library
 *
 * Centralized exports for all UI primitive components
 */

export { Badge } from './Badge'
export { Banner } from './Banner'

export type { BannerProps } from './Banner'
export { Button } from './Button'

export type { ButtonSize, ButtonVariant } from './Button'
export { Card } from './Card'

export type { CardPadding, CardVariant } from './Card'
export { Input } from './Input'

export { Spinner } from './Spinner'

export type { SpinnerSize } from './Spinner'
export { StatusMessage } from './StatusMessage'

export type { StatusMessageProps } from './StatusMessage'
// Re-export types from shared config to maintain backward compatibility
export type { BadgeSize, BadgeVariant } from '@shared/config/types/ui-types'
