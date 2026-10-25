export interface AutoReminderSettings {
  id?: string;
  engine_active: boolean;
  next_schedule: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  stop_on_payment: boolean;
  denda_repeat_days: number;
}

export interface ReminderCadenceStep {
  id: string;
  step_code: string;
  title: string;
  badge_text?: string;
  description: string;
  scheduled_time: string;
  is_active: boolean;
  template_message: string;
  sort_order: number;
}
