import { TimeUnit } from '../types'

export function getTimeoutDuration(startDate: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - startDate.getTime()

  if (diffMs <= 0) {
    throw new Error('Timeout has already ended')
  }

  const days = Math.floor((diffMs % TimeUnit.Week) / TimeUnit.Day)
  const hours = Math.floor((diffMs % TimeUnit.Day) / TimeUnit.Hour)
  const minutes = Math.floor((diffMs % TimeUnit.Hour) / TimeUnit.Minute)
  const seconds = Math.floor((diffMs % TimeUnit.Minute) / TimeUnit.Second)

  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days} д.`)
  }

  if (hours > 0) {
    parts.push(`${hours} ч.`)
  }

  if (minutes > 0) {
    parts.push(`${minutes} мин.`)
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} сек.`)
  }

  return parts.join(' ')
}
