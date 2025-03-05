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
      sentence: {
        Row: {
          id: string
          meaning: string
          order: number
          original: string
          pronunciation: string
          song_id: string | null
        }
        Insert: {
          id?: string
          meaning: string
          order: number
          original: string
          pronunciation: string
          song_id?: string | null
        }
        Update: {
          id?: string
          meaning?: string
          order?: number
          original?: string
          pronunciation?: string
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sentence_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song"
            referencedColumns: ["id"]
          },
        ]
      }
      sentence_word: {
        Row: {
          id: string
          order: number
          sentence_id: string | null
          word_id: string | null
        }
        Insert: {
          id?: string
          order: number
          sentence_id?: string | null
          word_id?: string | null
        }
        Update: {
          id?: string
          order?: number
          sentence_id?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sentence_word_sentence_id_fkey"
            columns: ["sentence_id"]
            isOneToOne: false
            referencedRelation: "sentence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sentence_word_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "word"
            referencedColumns: ["id"]
          },
        ]
      }
      song: {
        Row: {
          created_at: string | null
          id: string
          title: string
          title_korean: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          title_korean?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          title_korean?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      unknown_word: {
        Row: {
          created_at: string | null
          id: string
          user_id: string | null
          word_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          word_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unknown_words_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unknown_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "word"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      word: {
        Row: {
          createdat: string | null
          hiragana: string | null
          id: string
          meaning: string
          order: number
          original: string
          pronunciation: string | null
          song_id: string | null
          updatedat: string | null
          word_type: string
        }
        Insert: {
          createdat?: string | null
          hiragana?: string | null
          id?: string
          meaning: string
          order: number
          original: string
          pronunciation?: string | null
          song_id?: string | null
          updatedat?: string | null
          word_type: string
        }
        Update: {
          createdat?: string | null
          hiragana?: string | null
          id?: string
          meaning?: string
          order?: number
          original?: string
          pronunciation?: string | null
          song_id?: string | null
          updatedat?: string | null
          word_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
