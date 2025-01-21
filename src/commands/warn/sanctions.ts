import { TimeUnit, Violation, type Sanctions } from '~/shared/types'

const sanctions: Sanctions = {
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
}

export default sanctions
