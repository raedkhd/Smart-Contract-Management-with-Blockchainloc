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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          payload: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          payload?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          payload?: Json | null
        }
        Relationships: []
      }
      blockchain_networks: {
        Row: {
          chain_id: number | null
          created_at: string
          explorer_url: string | null
          id: string
          is_active: boolean
          is_testnet: boolean
          name: string
          native_currency: string | null
          rpc_url: string | null
          updated_at: string
        }
        Insert: {
          chain_id?: number | null
          created_at?: string
          explorer_url?: string | null
          id?: string
          is_active?: boolean
          is_testnet?: boolean
          name: string
          native_currency?: string | null
          rpc_url?: string | null
          updated_at?: string
        }
        Update: {
          chain_id?: number | null
          created_at?: string
          explorer_url?: string | null
          id?: string
          is_active?: boolean
          is_testnet?: boolean
          name?: string
          native_currency?: string | null
          rpc_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blockchain_transactions: {
        Row: {
          block_number: number | null
          created_at: string
          from_address: string | null
          gas_used: number | null
          id: string
          network_id: string | null
          raw: Json | null
          smart_contract_id: string | null
          status: string
          to_address: string | null
          tx_hash: string
          value: number | null
        }
        Insert: {
          block_number?: number | null
          created_at?: string
          from_address?: string | null
          gas_used?: number | null
          id?: string
          network_id?: string | null
          raw?: Json | null
          smart_contract_id?: string | null
          status?: string
          to_address?: string | null
          tx_hash: string
          value?: number | null
        }
        Update: {
          block_number?: number | null
          created_at?: string
          from_address?: string | null
          gas_used?: number | null
          id?: string
          network_id?: string | null
          raw?: Json | null
          smart_contract_id?: string | null
          status?: string
          to_address?: string | null
          tx_hash?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_transactions_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "blockchain_networks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blockchain_transactions_smart_contract_id_fkey"
            columns: ["smart_contract_id"]
            isOneToOne: false
            referencedRelation: "smart_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_activity: {
        Row: {
          actor_id: string | null
          contract_id: string
          created_at: string
          event: string
          id: string
          payload: Json | null
        }
        Insert: {
          actor_id?: string | null
          contract_id: string
          created_at?: string
          event: string
          id?: string
          payload?: Json | null
        }
        Update: {
          actor_id?: string | null
          contract_id?: string
          created_at?: string
          event?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_activity_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_approvals: {
        Row: {
          approver_id: string | null
          contract_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["approval_kind"]
          note: string | null
          signed_at: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approver_id?: string | null
          contract_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["approval_kind"]
          note?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approver_id?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["approval_kind"]
          note?: string | null
          signed_at?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "contract_approvals_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_participants: {
        Row: {
          contract_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_participants_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          changelog: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          id: string
          source_code: string
          version: string
        }
        Insert: {
          changelog?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          source_code?: string
          version: string
        }
        Update: {
          changelog?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          source_code?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          compiler: string | null
          created_at: string
          description: string | null
          id: string
          license: string | null
          name: string
          network: Database["public"]["Enums"]["contract_network"]
          owner_id: string
          source_code: string
          stage: Database["public"]["Enums"]["contract_stage"]
          updated_at: string
          version: string
        }
        Insert: {
          compiler?: string | null
          created_at?: string
          description?: string | null
          id?: string
          license?: string | null
          name: string
          network?: Database["public"]["Enums"]["contract_network"]
          owner_id: string
          source_code?: string
          stage?: Database["public"]["Enums"]["contract_stage"]
          updated_at?: string
          version?: string
        }
        Update: {
          compiler?: string | null
          created_at?: string
          description?: string | null
          id?: string
          license?: string | null
          name?: string
          network?: Database["public"]["Enums"]["contract_network"]
          owner_id?: string
          source_code?: string
          stage?: Database["public"]["Enums"]["contract_stage"]
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          contract_id: string
          created_at: string
          file_path: string | null
          file_url: string | null
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      signatures: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          ip_address: string | null
          participant_id: string | null
          signature_hash: string | null
          signed_at: string | null
          signer_id: string | null
          status: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          participant_id?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          signer_id?: string | null
          status?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          participant_id?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          signer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "contract_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_contracts: {
        Row: {
          abi: Json | null
          address: string | null
          bytecode: string | null
          contract_id: string
          created_at: string
          deployed_at: string | null
          deployed_by: string | null
          id: string
          network_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          abi?: Json | null
          address?: string | null
          bytecode?: string | null
          contract_id: string
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          id?: string
          network_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          abi?: Json | null
          address?: string | null
          bytecode?: string | null
          contract_id?: string
          created_at?: string
          deployed_at?: string | null
          deployed_by?: string | null
          id?: string
          network_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_contracts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_contracts_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "blockchain_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_assignments: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "legal" | "viewer"
      approval_kind: "legal_review" | "security_audit" | "final_signoff"
      approval_status: "pending" | "approved" | "rejected"
      contract_network:
        | "ethereum"
        | "arbitrum"
        | "optimism"
        | "base"
        | "polygon"
        | "sepolia"
      contract_stage: "draft" | "review" | "audit" | "approved" | "deployed"
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
    Enums: {
      app_role: ["admin", "legal", "viewer"],
      approval_kind: ["legal_review", "security_audit", "final_signoff"],
      approval_status: ["pending", "approved", "rejected"],
      contract_network: [
        "ethereum",
        "arbitrum",
        "optimism",
        "base",
        "polygon",
        "sepolia",
      ],
      contract_stage: ["draft", "review", "audit", "approved", "deployed"],
    },
  },
} as const
