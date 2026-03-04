export type Role = 'student' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: Role
  created_at: string
}

export interface Module {
  id: string
  code: string
  name: string
  description?: string
  price_zar: number
  active: boolean
  created_at: string
}

export interface Pdf {
  id: string
  module_id: string
  title: string
  storage_path: string
  file_size?: number
  page_count?: number
  sort_order: number
  active: boolean
  uploaded_at: string
}

export interface Entitlement {
  id: string
  user_id: string
  module_id: string
  granted_at: string
  expires_at?: string
}

export interface AccessCode {
  id: string
  code: string
  module_id: string
  max_uses: number
  use_count: number
  expires_at?: string
  created_at: string
  redeemed_by?: string
  redeemed_at?: string
  status: 'active' | 'redeemed' | 'expired' | 'revoked'
  modules?: Module
  profiles?: Profile
}

export interface Payment {
  id: string
  payer_name: string
  reference: string
  module_id: string
  amount_zar: number
  date_paid: string
  code_id?: string
  notes?: string
  created_at: string
  modules?: Module
  access_codes?: AccessCode
}

export interface Session {
  id: string
  user_id: string
  token_hash: string
  created_at: string
  last_seen: string
  revoked_at?: string
  ip_hash?: string
  device_info?: string
  is_active: boolean
}
