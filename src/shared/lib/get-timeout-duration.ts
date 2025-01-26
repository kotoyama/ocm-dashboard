import { TimeUnit } from '../types'

export function getTimeoutDuration(startDate: Date, endDate: Date): string
export function getTimeoutDuration(duration: number): string

export function getTimeoutDuration(arg1: unknown, arg2?: unknown): string {
  let diffMs: number

  if (arg2) {
    if (!(arg1 instanceof Date) || !(arg2 instanceof Date)) {
      throw new Error('❌ Both arguments must be Date objects')
    }
    diffMs = arg2.getTime() - arg1.getTime()
  } else {
    diffMs = arg1 as number
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
