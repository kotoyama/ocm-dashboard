import { TimeUnit, Violation } from '~/shared/types'

export default {
  colors: {
    success: 0x00ff00,
    info: 0x0080ff,
    error: 0xff0000,
  },
  violations: {
    [Violation.Respect]: 'Неуважение',
    [Violation.ProhibitedTopics]: 'Запрещённые темы',
    [Violation.InappropriateContent]: 'Неприемлемый контент',
    [Violation.Privacy]: 'Нарушение конфиденциальности',
    [Violation.Other]: 'Другое',
  },
  sactions: {
    [Violation.Respect]: [
      { warns: 1, timeout: 10 * TimeUnit.Minute, label: '10 минут' },
      { warns: 2, timeout: TimeUnit.Hour, label: '1 час' },
      { warns: 3, timeout: 4 * TimeUnit.Hour, label: '4 часа' },
      { warns: 4, timeout: 12 * TimeUnit.Hour, label: '12 часов' },
      { warns: 5, timeout: TimeUnit.Day, label: '1 день' },
    ],
    [Violation.ProhibitedTopics]: [
      { warns: 1, timeout: 4 * TimeUnit.Hour, label: '4 часа' },
      { warns: 2, timeout: 12 * TimeUnit.Hour, label: '12 часов' },
      { warns: 3, timeout: TimeUnit.Day, label: '1 день' },
    ],
    [Violation.InappropriateContent]: [
      { warns: 1, timeout: TimeUnit.Hour, label: '1 час' },
      { warns: 2, timeout: 12 * TimeUnit.Hour, label: '12 часов' },
      { warns: 3, timeout: TimeUnit.Day, label: '1 день' },
    ],
    [Violation.Privacy]: [
      { warns: 1, timeout: 12 * TimeUnit.Hour, label: '12 часов' },
      { warns: 2, timeout: TimeUnit.Day, label: '1 день' },
      { warns: 3, timeout: TimeUnit.Week, label: '7 дней' },
    ],
    [Violation.Other]: [],
  },
}
