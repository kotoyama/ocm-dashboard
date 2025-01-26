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
      { warns: 1, timeout: 10 * TimeUnit.Minute },
      { warns: 2, timeout: TimeUnit.Hour },
      { warns: 3, timeout: 4 * TimeUnit.Hour },
      { warns: 4, timeout: 12 * TimeUnit.Hour },
      { warns: 5, timeout: TimeUnit.Day },
    ],
    [Violation.ProhibitedTopics]: [
      { warns: 1, timeout: 4 * TimeUnit.Hour },
      { warns: 2, timeout: 12 * TimeUnit.Hour },
      { warns: 3, timeout: TimeUnit.Day },
    ],
    [Violation.InappropriateContent]: [
      { warns: 1, timeout: TimeUnit.Hour },
      { warns: 2, timeout: 12 * TimeUnit.Hour },
      { warns: 3, timeout: TimeUnit.Day },
    ],
    [Violation.Privacy]: [
      { warns: 1, timeout: 12 * TimeUnit.Hour },
      { warns: 2, timeout: TimeUnit.Day },
      { warns: 3, timeout: TimeUnit.Week },
    ],
    [Violation.Other]: [],
  },
}
