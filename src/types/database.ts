export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          workspace_id: string | null;
          event_type: Database["public"]["Enums"]["analytics_event_type"];
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          workspace_id?: string | null;
          event_type: Database["public"]["Enums"]["analytics_event_type"];
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          workspace_id?: string | null;
          event_type?: Database["public"]["Enums"]["analytics_event_type"];
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_rate_limits: {
        Row: {
          id: string;
          user_id: string;
          action: "breakdown" | "remix" | "voice";
          requested_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: "breakdown" | "remix" | "voice";
          requested_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: "breakdown" | "remix" | "voice";
          requested_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      beta_waitlist: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          use_case: string | null;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          use_case?: string | null;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          use_case?: string | null;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      beta_testers: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          full_name: string | null;
          persona: Database["public"]["Enums"]["beta_persona"];
          invite_status: Database["public"]["Enums"]["beta_invite_status"];
          signup_status: Database["public"]["Enums"]["beta_signup_status"];
          core_flow_status: Database["public"]["Enums"]["beta_core_flow_status"];
          feedback_status: Database["public"]["Enums"]["beta_feedback_status"];
          user_id: string | null;
          notes: string | null;
          invited_at: string | null;
          signed_up_at: string | null;
          completed_at: string | null;
          feedback_received_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          full_name?: string | null;
          persona?: Database["public"]["Enums"]["beta_persona"];
          invite_status?: Database["public"]["Enums"]["beta_invite_status"];
          signup_status?: Database["public"]["Enums"]["beta_signup_status"];
          core_flow_status?: Database["public"]["Enums"]["beta_core_flow_status"];
          feedback_status?: Database["public"]["Enums"]["beta_feedback_status"];
          user_id?: string | null;
          notes?: string | null;
          invited_at?: string | null;
          signed_up_at?: string | null;
          completed_at?: string | null;
          feedback_received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          full_name?: string | null;
          persona?: Database["public"]["Enums"]["beta_persona"];
          invite_status?: Database["public"]["Enums"]["beta_invite_status"];
          signup_status?: Database["public"]["Enums"]["beta_signup_status"];
          core_flow_status?: Database["public"]["Enums"]["beta_core_flow_status"];
          feedback_status?: Database["public"]["Enums"]["beta_feedback_status"];
          user_id?: string | null;
          notes?: string | null;
          invited_at?: string | null;
          signed_up_at?: string | null;
          completed_at?: string | null;
          feedback_received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "beta_testers_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "beta_testers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback_entries: {
        Row: {
          id: string;
          workspace_id: string;
          beta_tester_id: string | null;
          created_by: string | null;
          source:
            | "google_form"
            | "manual_chat"
            | "email"
            | "dogfood"
            | "other";
          source_ref: string | null;
          reporter_name: string | null;
          reporter_persona:
            | "creator"
            | "freelancer"
            | "agency"
            | "educator"
            | "beauty_lifestyle"
            | "other"
            | null;
          cohort: string;
          raw_summary: string;
          verbatim_quotes: string[];
          category: "bug" | "ux" | "fr" | "ai" | "price" | "positive";
          priority: "p0" | "p1" | "p2" | "p3" | null;
          status: "untriaged" | "triaged" | "actioned" | "closed";
          linear_issue_id: string | null;
          action_notes: string | null;
          replied_to_user: boolean;
          device: "desktop" | "mobile" | "both" | "unknown" | null;
          reproducible: "yes" | "no" | "not_tried" | null;
          notes: string | null;
          triaged_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          beta_tester_id?: string | null;
          created_by?: string | null;
          source:
            | "google_form"
            | "manual_chat"
            | "email"
            | "dogfood"
            | "other";
          source_ref?: string | null;
          reporter_name?: string | null;
          reporter_persona?:
            | "creator"
            | "freelancer"
            | "agency"
            | "educator"
            | "beauty_lifestyle"
            | "other"
            | null;
          cohort?: string;
          raw_summary: string;
          verbatim_quotes?: string[];
          category: "bug" | "ux" | "fr" | "ai" | "price" | "positive";
          priority?: "p0" | "p1" | "p2" | "p3" | null;
          status?: "untriaged" | "triaged" | "actioned" | "closed";
          linear_issue_id?: string | null;
          action_notes?: string | null;
          replied_to_user?: boolean;
          device?: "desktop" | "mobile" | "both" | "unknown" | null;
          reproducible?: "yes" | "no" | "not_tried" | null;
          notes?: string | null;
          triaged_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          beta_tester_id?: string | null;
          created_by?: string | null;
          source?:
            | "google_form"
            | "manual_chat"
            | "email"
            | "dogfood"
            | "other";
          source_ref?: string | null;
          reporter_name?: string | null;
          reporter_persona?:
            | "creator"
            | "freelancer"
            | "agency"
            | "educator"
            | "beauty_lifestyle"
            | "other"
            | null;
          cohort?: string;
          raw_summary?: string;
          verbatim_quotes?: string[];
          category?: "bug" | "ux" | "fr" | "ai" | "price" | "positive";
          priority?: "p0" | "p1" | "p2" | "p3" | null;
          status?: "untriaged" | "triaged" | "actioned" | "closed";
          linear_issue_id?: string | null;
          action_notes?: string | null;
          replied_to_user?: boolean;
          device?: "desktop" | "mobile" | "both" | "unknown" | null;
          reproducible?: "yes" | "no" | "not_tried" | null;
          notes?: string | null;
          triaged_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_entries_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_entries_beta_tester_id_fkey";
            columns: ["beta_tester_id"];
            isOneToOne: false;
            referencedRelation: "beta_testers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_entries_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      health_check: {
        Row: {
          id: number;
          status: string;
          checked_at: string;
        };
        Insert: {
          id?: never;
          status?: string;
          checked_at?: string;
        };
        Update: {
          id?: never;
          status?: string;
          checked_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member" | "viewer";
          joined_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member" | "viewer";
          joined_at?: string;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          color: string | null;
          sort_order: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          sort_order?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_content_items: {
        Row: {
          id: string;
          board_id: string;
          content_item_id: string;
          sort_order: number;
          added_by: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          content_item_id: string;
          sort_order?: number;
          added_by?: string | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          content_item_id?: string;
          sort_order?: number;
          added_by?: string | null;
          added_at?: string;
        };
        Relationships: [];
      };
      board_saved_views: {
        Row: {
          id: string;
          board_id: string;
          workspace_id: string;
          created_by: string;
          name: string;
          search_query: string | null;
          platform_filters: string[] | null;
          tag_filters: string[] | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          workspace_id: string;
          created_by: string;
          name: string;
          search_query?: string | null;
          platform_filters?: string[] | null;
          tag_filters?: string[] | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          workspace_id?: string;
          created_by?: string;
          name?: string;
          search_query?: string | null;
          platform_filters?: string[] | null;
          tag_filters?: string[] | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_items: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          platform: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
          source_url: string | null;
          raw_content: string | null;
          author_name: string | null;
          saved_by: string | null;
          saved_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
          source_url?: string | null;
          raw_content?: string | null;
          author_name?: string | null;
          saved_by?: string | null;
          saved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
          source_url?: string | null;
          raw_content?: string | null;
          author_name?: string | null;
          saved_by?: string | null;
          saved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          name_normalized: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          name_normalized: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          name_normalized?: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_item_tags: {
        Row: {
          content_item_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          content_item_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          content_item_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      content_analyses: {
        Row: {
          id: string;
          content_item_id: string;
          workspace_id: string;
          hook: string | null;
          angle: string | null;
          structure: string | null;
          cta: string | null;
          summary: string | null;
          ai_model: string | null;
          status: "pending" | "completed" | "failed";
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_item_id: string;
          workspace_id: string;
          hook?: string | null;
          angle?: string | null;
          structure?: string | null;
          cta?: string | null;
          summary?: string | null;
          ai_model?: string | null;
          status?: "pending" | "completed" | "failed";
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_item_id?: string;
          workspace_id?: string;
          hook?: string | null;
          angle?: string | null;
          structure?: string | null;
          cta?: string | null;
          summary?: string | null;
          ai_model?: string | null;
          status?: "pending" | "completed" | "failed";
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      voice_profiles: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          name: string;
          tone: string | null;
          style_notes: string | null;
          sample_count: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          name: string;
          tone?: string | null;
          style_notes?: string | null;
          sample_count?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          name?: string;
          tone?: string | null;
          style_notes?: string | null;
          sample_count?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_calendar_items: {
        Row: {
          id: string;
          workspace_id: string;
          generated_output_id: string | null;
          content_item_id: string | null;
          title: string;
          platform: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
          scheduled_at: string;
          status: "scheduled" | "published" | "skipped" | "failed";
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          generated_output_id?: string | null;
          content_item_id?: string | null;
          title: string;
          platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
          scheduled_at: string;
          status?: "scheduled" | "published" | "skipped" | "failed";
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          generated_output_id?: string | null;
          content_item_id?: string | null;
          title?: string;
          platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
          scheduled_at?: string;
          status?: "scheduled" | "published" | "skipped" | "failed";
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generated_outputs: {
        Row: {
          id: string;
          workspace_id: string;
          source_content_item_id: string | null;
          voice_profile_id: string | null;
          title: string | null;
          content: string;
          status: "draft" | "ready" | "published" | "archived";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          source_content_item_id?: string | null;
          voice_profile_id?: string | null;
          title?: string | null;
          content: string;
          status?: "draft" | "ready" | "published" | "archived";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          source_content_item_id?: string | null;
          voice_profile_id?: string | null;
          title?: string | null;
          content?: string;
          status?: "draft" | "ready" | "published" | "archived";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_connected_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider:
            | "facebook"
            | "tiktok"
            | "instagram"
            | "youtube"
            | "linkedin"
            | "notion"
            | "googlesheets"
            | "telegram"
            | "slack";
          connected_account_id: string;
          status: "initiated" | "active" | "failed" | "revoked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider:
            | "facebook"
            | "tiktok"
            | "instagram"
            | "youtube"
            | "linkedin"
            | "notion"
            | "googlesheets"
            | "telegram"
            | "slack";
          connected_account_id: string;
          status?: "initiated" | "active" | "failed" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?:
            | "facebook"
            | "tiktok"
            | "instagram"
            | "youtube"
            | "linkedin"
            | "notion"
            | "googlesheets"
            | "telegram"
            | "slack";
          connected_account_id?: string;
          status?: "initiated" | "active" | "failed" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_connected_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      analytics_event_type:
        | "signup"
        | "login"
        | "board_create"
        | "content_add"
        | "breakdown_run"
        | "remix_run"
        | "calendar_add"
        | "nudge_shown"
        | "nudge_clicked";
      beta_persona:
        | "creator"
        | "agency"
        | "beauty_lifestyle"
        | "educator_coach"
        | "other";
      beta_invite_status:
        | "pending"
        | "invited"
        | "accepted"
        | "declined"
        | "expired";
      beta_signup_status: "not_signed_up" | "signed_up" | "onboarded";
      beta_core_flow_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "partial";
      beta_feedback_status:
        | "not_requested"
        | "requested"
        | "received"
        | "n/a";
      workspace_role: "owner" | "admin" | "member" | "viewer";
      platform_type: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
      analysis_status: "pending" | "completed" | "failed";
      output_status: "draft" | "ready" | "published" | "archived";
      calendar_status: "scheduled" | "published" | "skipped" | "failed";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type HealthCheckRow = Database["public"]["Tables"]["health_check"]["Row"];
