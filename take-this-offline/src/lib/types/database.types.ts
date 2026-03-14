// Generated from supabase/migrations/20260313000000_initial_schema.sql
// Run `npx supabase gen types typescript --project-id <project-ref> > src/lib/types/database.types.ts`
// to regenerate from the live schema after applying the migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_activity: {
        Row: {
          id: string
          user_id: string
          word_id: string
          activity_type: 'flashcard' | 'fill_blank' | 'sentence' | 'context_match'
          completed_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          activity_type: 'flashcard' | 'fill_blank' | 'sentence' | 'context_match'
          completed_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          activity_type?: 'flashcard' | 'fill_blank' | 'sentence' | 'context_match'
          completed_date?: string
          created_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: { user_id: string; word_id: string; created_at: string }
        Insert: { user_id: string; word_id: string; created_at?: string }
        Update: { created_at?: string }
        Relationships: []
      }
      user_stats: {
        Row: {
          user_id: string
          total_points: number
          streak_count: number
          last_active_date: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          total_points?: number
          streak_count?: number
          last_active_date?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_points?: number
          streak_count?: number
          last_active_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      word_mastery: {
        Row: {
          user_id: string
          word_id: string
          mastery_level: 'seen' | 'learning' | 'mastered'
          activity_count: number
          updated_at: string
        }
        Insert: {
          user_id: string
          word_id: string
          mastery_level?: 'seen' | 'learning' | 'mastered'
          activity_count?: number
          updated_at?: string
        }
        Update: {
          mastery_level?: 'seen' | 'learning' | 'mastered'
          activity_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_digest_prefs: {
        Row: {
          user_id: string
          enabled: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          enabled?: boolean
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          auth: string
          p256dh: string
          timezone: string
          notify_hour: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          auth: string
          p256dh: string
          timezone?: string
          notify_hour?: number
          created_at?: string
        }
        Update: {
          timezone?: string
          notify_hour?: number
        }
        Relationships: []
      }
      words: {
        Row: {
          id: string
          title: string
          slug: string
          daily_date: string
          category: Database["public"]["Enums"]["word_category"]
          definition: string
          exec_summary: string
          where_used: string
          usage_examples: Json
          heard_in_wild: string | null
          heard_source_url: string | null
          embedding: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          daily_date: string
          category: Database["public"]["Enums"]["word_category"]
          definition: string
          exec_summary: string
          where_used: string
          usage_examples?: Json
          heard_in_wild?: string | null
          heard_source_url?: string | null
          embedding?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          daily_date?: string
          category?: Database["public"]["Enums"]["word_category"]
          definition?: string
          exec_summary?: string
          where_used?: string
          usage_examples?: Json
          heard_in_wild?: string | null
          heard_source_url?: string | null
          embedding?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      word_category:
        | "Strategy"
        | "Tech"
        | "Finance"
        | "HR"
        | "Operations"
        | "Marketing"
        | "Legal"
        | "Other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
