import { Violation } from '../types'

export const violationChoices = {
  [Violation.Respect]: 'Неуважение',
  [Violation.ProhibitedTopics]: 'Запрещённые темы',
  [Violation.InappropriateContent]: 'Неприемлемый контент',
  [Violation.Privacy]: 'Нарушение конфиденциальности',
  [Violation.Other]: 'Другое',
}
