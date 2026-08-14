export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          nickname: string | null;
          birth_order: string | null;
          default_pickup: string;
          default_dropoff: string;
          school: string | null;
          avatar_url: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          nickname?: string | null;
          birth_order?: string | null;
          default_pickup?: string;
          default_dropoff?: string;
          school?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nickname?: string | null;
          birth_order?: string | null;
          default_pickup?: string;
          default_dropoff?: string;
          school?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          base_round_trip: number;
          different_pickup_fee: number;
          effective_from: string;
          effective_until: string | null;
          is_active: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          base_round_trip?: number;
          different_pickup_fee?: number;
          effective_from?: string;
          effective_until?: string | null;
          is_active?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          base_round_trip?: number;
          different_pickup_fee?: number;
          effective_from?: string;
          effective_until?: string | null;
          is_active?: boolean;
          description?: string | null;
          updated_at?: string;
        };
      };
      transport_records: {
        Row: {
          id: string;
          user_id: string;
          service_date: string;
          shared_pickup_time: string;
          base_fee: number;
          additional_fee: number;
          total_fee: number;
          pricing_rule_id: string | null;
          status: 'completed' | 'scheduled' | 'cancelled';
          payment_status: 'paid' | 'unpaid';
          has_different_dropoff: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_date: string;
          shared_pickup_time?: string;
          base_fee?: number;
          additional_fee?: number;
          total_fee?: number;
          pricing_rule_id?: string | null;
          status?: 'completed' | 'scheduled' | 'cancelled';
          payment_status?: 'paid' | 'unpaid';
          has_different_dropoff?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          service_date?: string;
          shared_pickup_time?: string;
          base_fee?: number;
          additional_fee?: number;
          total_fee?: number;
          pricing_rule_id?: string | null;
          status?: 'completed' | 'scheduled' | 'cancelled';
          payment_status?: 'paid' | 'unpaid';
          has_different_dropoff?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
      };
      transport_items: {
        Row: {
          id: string;
          transport_record_id: string;
          child_id: string;
          pickup_time: string;
          dropoff_time: string;
          is_attending: boolean;
          item_fee: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transport_record_id: string;
          child_id: string;
          pickup_time: string;
          dropoff_time: string;
          is_attending?: boolean;
          item_fee?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pickup_time?: string;
          dropoff_time?: string;
          is_attending?: boolean;
          item_fee?: number;
          notes?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          transport_record_id: string | null;
          amount: number;
          status: 'paid' | 'unpaid' | 'pending';
          paid_at: string;
          payment_method: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transport_record_id?: string | null;
          amount: number;
          status?: 'paid' | 'unpaid' | 'pending';
          paid_at?: string;
          payment_method?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          status?: 'paid' | 'unpaid' | 'pending';
          paid_at?: string;
          payment_method?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
