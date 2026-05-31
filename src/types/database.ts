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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      workspace_role: "owner" | "admin" | "member" | "viewer";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type HealthCheckRow = Database["public"]["Tables"]["health_check"]["Row"];
