/**
 * Auto-generated TypeScript types for the Supabase database schema.
 *
 * Matches the migration: 20260724000000_rebuild_schema.sql
 *
 * To regenerate after schema changes, run:
 *   npx supabase gen types typescript --linked > src/lib/database.types.ts
 */

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
      opportunities: {
        Row: {
          id: string;
          slug: string;
          name: string;
          owner_name: string | null;
          owner_phone: string | null;
          cfa_comment: string | null;
          guarantee: string | null;
          category: string | null;
          investment_type: string | null;
          bank_details: string | null;
          investment_amount: string | null;
          expected_profit: string | null;
          profit_period: string | null;
          status: string | null;
          description: string | null;
          address: string | null;
          organization_type: string | null;
          estimated_capital: string | null;
          website_url: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          owner_name?: string | null;
          owner_phone?: string | null;
          cfa_comment?: string | null;
          guarantee?: string | null;
          category?: string | null;
          investment_type?: string | null;
          bank_details?: string | null;
          investment_amount?: string | null;
          expected_profit?: string | null;
          profit_period?: string | null;
          status?: string | null;
          description?: string | null;
          address?: string | null;
          organization_type?: string | null;
          estimated_capital?: string | null;
          website_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          owner_name?: string | null;
          owner_phone?: string | null;
          cfa_comment?: string | null;
          guarantee?: string | null;
          category?: string | null;
          investment_type?: string | null;
          bank_details?: string | null;
          investment_amount?: string | null;
          expected_profit?: string | null;
          profit_period?: string | null;
          status?: string | null;
          description?: string | null;
          address?: string | null;
          organization_type?: string | null;
          estimated_capital?: string | null;
          website_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          quote: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          quote: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          quote?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type OpportunityInsert = Database["public"]["Tables"]["opportunities"]["Insert"];
export type OpportunityUpdate = Database["public"]["Tables"]["opportunities"]["Update"];

export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type TestimonialInsert = Database["public"]["Tables"]["testimonials"]["Insert"];
export type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];
