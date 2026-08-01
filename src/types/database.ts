export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14";
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          automation_enabled: boolean;
          created_at: string;
          daily_publish_limit: number;
          id: string;
          language: string;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          automation_enabled?: boolean;
          created_at?: string;
          daily_publish_limit?: number;
          id?: string;
          language?: string;
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          automation_enabled?: boolean;
          created_at?: string;
          daily_publish_limit?: number;
          id?: string;
          language?: string;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      automation_logs: {
        Row: {
          created_at: string;
          event: string;
          id: string;
          level: Database["public"]["Enums"]["log_level"];
          message: string;
          metadata: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event: string;
          id?: string;
          level?: Database["public"]["Enums"]["log_level"];
          message: string;
          metadata?: Json;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event?: string;
          id?: string;
          level?: Database["public"]["Enums"]["log_level"];
          message?: string;
          metadata?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      channels: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          platform: Database["public"]["Enums"]["channel_platform"];
          status: Database["public"]["Enums"]["channel_status"];
          updated_at: string;
          user_id: string;
          youtube_channel_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          platform?: Database["public"]["Enums"]["channel_platform"];
          status?: Database["public"]["Enums"]["channel_status"];
          updated_at?: string;
          user_id: string;
          youtube_channel_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          platform?: Database["public"]["Enums"]["channel_platform"];
          status?: Database["public"]["Enums"]["channel_status"];
          updated_at?: string;
          user_id?: string;
          youtube_channel_id?: string | null;
        };
        Relationships: [];
      };
      content_items: {
        Row: {
          channel_id: string | null;
          created_at: string;
          description: string | null;
          external_video_id: string | null;
          id: string;
          license_status: Database["public"]["Enums"]["license_status"];
          published_at: string | null;
          scheduled_at: string | null;
          source_id: string | null;
          source_url: string | null;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          channel_id?: string | null;
          created_at?: string;
          description?: string | null;
          external_video_id?: string | null;
          id?: string;
          license_status?: Database["public"]["Enums"]["license_status"];
          published_at?: string | null;
          scheduled_at?: string | null;
          source_id?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          channel_id?: string | null;
          created_at?: string;
          description?: string | null;
          external_video_id?: string | null;
          id?: string;
          license_status?: Database["public"]["Enums"]["license_status"];
          published_at?: string | null;
          scheduled_at?: string | null;
          source_id?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_items_channel_id_fkey";
            columns: ["channel_id"];
            isOneToOne: false;
            referencedRelation: "channels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_items_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "content_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      content_sources: {
        Row: {
          attribution_text: string | null;
          created_at: string;
          evidence_url: string | null;
          id: string;
          license_status: Database["public"]["Enums"]["license_status"];
          license_type: Database["public"]["Enums"]["license_type"];
          name: string;
          source_type: Database["public"]["Enums"]["content_source_type"];
          source_url: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attribution_text?: string | null;
          created_at?: string;
          evidence_url?: string | null;
          id?: string;
          license_status?: Database["public"]["Enums"]["license_status"];
          license_type: Database["public"]["Enums"]["license_type"];
          name: string;
          source_type: Database["public"]["Enums"]["content_source_type"];
          source_url: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attribution_text?: string | null;
          created_at?: string;
          evidence_url?: string | null;
          id?: string;
          license_status?: Database["public"]["Enums"]["license_status"];
          license_type?: Database["public"]["Enums"]["license_type"];
          name?: string;
          source_type?: Database["public"]["Enums"]["content_source_type"];
          source_url?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["profile_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["profile_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["profile_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_my_settings: {
        Args: {
          p_automation_enabled: boolean;
          p_daily_publish_limit: number;
          p_full_name: string;
          p_language: string;
          p_timezone: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      channel_platform: "youtube";
      channel_status: "draft" | "active" | "paused" | "error";
      content_source_type: "youtube" | "upload" | "external";
      content_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "scheduled"
        | "publishing"
        | "published"
        | "failed"
        | "cancelled";
      license_status: "pending" | "verified" | "rejected" | "expired";
      license_type:
        | "owned"
        | "creative_commons"
        | "licensed"
        | "public_domain"
        | "permission"
        | "unknown";
      log_level: "debug" | "info" | "warning" | "error";
      profile_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];
type PublicTableName = keyof PublicSchema["Tables"];
type PublicEnumName = keyof PublicSchema["Enums"];

export type Tables<TableName extends PublicTableName> =
  PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<TableName extends PublicTableName> =
  PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<TableName extends PublicTableName> =
  PublicSchema["Tables"][TableName]["Update"];

export type Enums<EnumName extends PublicEnumName> =
  PublicSchema["Enums"][EnumName];

export const Constants = {
  public: {
    Enums: {
      channel_platform: ["youtube"],
      channel_status: ["draft", "active", "paused", "error"],
      content_source_type: ["youtube", "upload", "external"],
      content_status: [
        "draft",
        "pending_approval",
        "approved",
        "scheduled",
        "publishing",
        "published",
        "failed",
        "cancelled",
      ],
      license_status: ["pending", "verified", "rejected", "expired"],
      license_type: [
        "owned",
        "creative_commons",
        "licensed",
        "public_domain",
        "permission",
        "unknown",
      ],
      log_level: ["debug", "info", "warning", "error"],
      profile_role: ["user", "admin"],
    },
  },
} as const;
