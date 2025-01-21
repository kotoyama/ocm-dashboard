export enum TimeUnit {
  Second = 1000,
  Minute = 60 * TimeUnit.Second,
  Hour = 60 * TimeUnit.Minute,
  Day = 24 * TimeUnit.Hour,
  Week = 7 * TimeUnit.Day,
}

export enum Violation {
  Respect = 'respect_violation',
  ProhibitedTopics = 'prohibited_topics',
  InappropriateContent = 'inappropriate_content',
  Privacy = 'privacy_violation',
  Other = 'other',
}

export type SanctionLevel = {
  warns: number
  timeout: number
  label: string
}

export type Sanctions = {
  [key in Violation]: SanctionLevel[]
}
