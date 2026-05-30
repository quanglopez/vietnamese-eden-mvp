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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type HealthCheckRow = Database["public"]["Tables"]["health_check"]["Row"];
