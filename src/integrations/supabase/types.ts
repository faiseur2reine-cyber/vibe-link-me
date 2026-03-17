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
          avatar_shape: string | null
          avatar_url: string | null
          bio: string | null
          button_radius: number | null
          button_style: string | null
          connected_label: string
          content_spacing: string | null
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
          geo_greeting_enabled: boolean
          id: string
          is_nsfw: boolean
          link_layout: string | null
          location: string
          notes: string
          operator: string
          revenue_commission: number
          revenue_monthly: number
          safe_page_enabled: boolean
          safe_page_redirect_url: string
          social_links: Json
          status: string
          theme: string
          tracking_ga4: string
          tracking_meta_pixel: string
          tracking_tiktok_pixel: string
          updated_at: string
          urgency_config: Json | null
          user_id: string
          username: string
          utm_campaign: string
          utm_medium: string
          utm_source: string
        }
        Insert: {
          avatar_shape?: string | null
          avatar_url?: string | null
          bio?: string | null
          button_radius?: number | null
          button_style?: string | null
          connected_label?: string
          content_spacing?: string | null
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
          geo_greeting_enabled?: boolean
          id?: string
          is_nsfw?: boolean
          link_layout?: string | null
          location?: string
          notes?: string
          operator?: string
          revenue_commission?: number
          revenue_monthly?: number
          safe_page_enabled?: boolean
          safe_page_redirect_url?: string
          social_links?: Json
          status?: string
          theme?: string
          tracking_ga4?: string
          tracking_meta_pixel?: string
          tracking_tiktok_pixel?: string
          updated_at?: string
          urgency_config?: Json | null
          user_id: string
          username: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
        }
        Update: {
          avatar_shape?: string | null
          avatar_url?: string | null
          bio?: string | null
          button_radius?: number | null
          button_style?: string | null
          connected_label?: string
          content_spacing?: string | null
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
          geo_greeting_enabled?: boolean
          id?: string
          is_nsfw?: boolean
          link_layout?: string | null
          location?: string
          notes?: string
          operator?: string
          revenue_commission?: number
          revenue_monthly?: number
          safe_page_enabled?: boolean
          safe_page_redirect_url?: string
          social_links?: Json
          status?: string
          theme?: string
          tracking_ga4?: string
          tracking_meta_pixel?: string
          tracking_tiktok_pixel?: string
          updated_at?: string
          urgency_config?: Json | null
          user_id?: string
          username?: string
          utm_campaign?: string
          utm_medium?: string
          utm_source?: string
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
          browser: string | null
          city: string | null
          clicked_at: string
          country: string | null
          device_type: string | null
          id: string
          link_id: string
          os: string | null
          referrer: string | null
        }
        Insert: {
          ab_variant?: string | null
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          link_id: string
          os?: string | null
          referrer?: string | null
        }
        Update: {
          ab_variant?: string | null
          browser?: string | null
          city?: string | null
          clicked_at?: string
          country?: string | null
          device_type?: string | null
          id?: string
          link_id?: string
          os?: string | null
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
          expires_at: string | null
          icon: string | null
          id: string
          is_visible: boolean
          page_id: string | null
          position: number
          scheduled_at: string | null
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
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          page_id?: string | null
          position?: number
          scheduled_at?: string | null
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
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          page_id?: string | null
          position?: number
          scheduled_at?: string | null
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
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          os: string | null
          page_id: string
          referrer: string | null
          viewed_at: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          os?: string | null
          page_id: string
          referrer?: string | null
          viewed_at?: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          os?: string | null
          page_id?: string
          referrer?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "creator_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          custom_domain: string | null
          display_name: string | null
          domain_verified: boolean | null
          email_weekly: boolean
          id: string
          is_nsfw: boolean
          onboarding_completed: boolean
          plan: string
          referral_code: string | null
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
          custom_domain?: string | null
          display_name?: string | null
          domain_verified?: boolean | null
          email_weekly?: boolean
          id?: string
          is_nsfw?: boolean
          onboarding_completed?: boolean
          plan?: string
          referral_code?: string | null
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
          custom_domain?: string | null
          display_name?: string | null
          domain_verified?: boolean | null
          email_weekly?: boolean
          id?: string
          is_nsfw?: boolean
          onboarding_completed?: boolean
          plan?: string
          referral_code?: string | null
          social_links?: Json
          theme?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_rate: number
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
          total_earned: number
        }
        Insert: {
          commission_rate?: number
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
          total_earned?: number
        }
        Update: {
          commission_rate?: number
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
          total_earned?: number
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
        | {
            Args: {
              p_ab_variant?: string
              p_browser?: string
              p_city?: string
              p_country?: string
              p_device_type?: string
              p_link_id: string
              p_os?: string
              p_referrer?: string
            }
            Returns: undefined
          }
      record_page_view:
        | {
            Args: {
              p_city?: string
              p_country?: string
              p_page_id: string
              p_referrer?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_browser?: string
              p_city?: string
              p_country?: string
              p_device_type?: string
              p_os?: string
              p_page_id: string
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
