export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      creator_pages: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          custom_accent_color: string | null
          custom_bg_color: string | null
          custom_btn_color: string | null
          custom_btn_text_color: string | null
          custom_css: string | null
          custom_font: string | null
          custom_text_color: string | null
          display_name: string | null
          id: string
          is_nsfw: boolean
          link_layout: string | null
          social_links: Json
          theme: string
          updated_at: string
          urgency_config: Json | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          custom_accent_color?: string | null
          custom_bg_color?: string | null
          custom_btn_color?: string | null
          custom_btn_text_color?: string | null
          custom_css?: string | null
          custom_font?: string | null
          custom_text_color?: string | null
          display_name?: string | null
          id?: string
          is_nsfw?: boolean
          link_layout?: string | null
          social_links?: Json
          theme?: string
          updated_at?: string
          urgency_config?: Json | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          custom_accent_color?: string | null
          custom_bg_color?: string | null
          custom_btn_color?: string | null
          custom_btn_text_color?: string | null
          custom_css?: string | null
          custom_font?: string | null
          custom_text_color?: string | null
          display_name?: string | null
          id?: string
          is_nsfw?: boolean
          link_layout?: string | null
          social_links?: Json
          theme?: string
          updated_at?: string
          urgency_config?: Json | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      custom_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          links: Json
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          links?: Json
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          links?: Json
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      link_clicks: {
        Row: {
          ab_variant: string | null
          city: string | null
          clicked_at: string
          country: string | null
          id: string
          link_id: string
          referrer: string | null
        }
        Insert: {
          ab_variant?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          id?: string
          link_id: string
          referrer?: string | null
        }
        Update: {
          ab_variant?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          id?: string
          link_id?: string
          referrer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          bg_color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          page_id: string | null
          position: number
          section_title: string | null
          style: string
          text_color: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          page_id?: string | null
          position?: number
          section_title?: string | null
          style?: string
          text_color?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          page_id?: string | null
          position?: number
          section_title?: string | null
          style?: string
          text_color?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "creator_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_state: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_steps: Json | null
          created_at: string
          current_step: string | null
          id: string
          skipped: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string
          current_step?: string | null
          id?: string
          skipped?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string
          current_step?: string | null
          id?: string
          skipped?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_nsfw: boolean
          onboarding_completed: boolean
          plan: string
          social_links: Json
          theme: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_nsfw?: boolean
          onboarding_completed?: boolean
          plan?: string
          social_links?: Json
          theme?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_nsfw?: boolean
          onboarding_completed?: boolean
          plan?: string
          social_links?: Json
          theme?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      urgency_templates: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_click:
        | { Args: { p_link_id: string }; Returns: undefined }
        | {
            Args: {
              p_city?: string
              p_country?: string
              p_link_id: string
              p_referrer?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_ab_variant?: string
              p_city?: string
              p_country?: string
              p_link_id: string
              p_referrer?: string
            }
            Returns: undefined
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
