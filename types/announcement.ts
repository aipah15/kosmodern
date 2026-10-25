export type AnnouncementCategory =
  | 'umum'
  | 'tagihan'
  | 'perawatan'
  | 'ketertiban'
  | 'darurat';

export type AnnouncementTarget = 'all' | 'floor' | 'specific';

export interface AnnouncementAttachment {
  name: string;
  size: string;
  url?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: AnnouncementCategory;
  category_label?: string;
  content: string;
  target_audience: AnnouncementTarget;
  target_label?: string;
  target_floors?: string[];
  target_tenant_ids?: string[];
  is_pinned?: boolean;
  is_important?: boolean;
  attachments?: AnnouncementAttachment[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
