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
      content_items: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          platform: "tiktok" | "facebook" | "instagram" | "youtube" | "other";
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
          platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "other";
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
          platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "other";
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      workspace_role: "owner" | "admin" | "member" | "viewer";
      platform_type: "tiktok" | "facebook" | "instagram" | "youtube" | "other";
      analysis_status: "pending" | "completed" | "failed";
      output_status: "draft" | "ready" | "published" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type HealthCheckRow = Database["public"]["Tables"]["health_check"]["Row"];
