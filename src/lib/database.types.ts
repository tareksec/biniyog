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
      homepage_reviews: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          quote: string;
          rating: number | null;
          avatar_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          location?: string | null;
          quote: string;
          rating?: number | null;
          avatar_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          quote?: string;
          rating?: number | null;
          avatar_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
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
          image_urls: string[] | null;
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
          image_urls?: string[] | null;
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
          image_urls?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunity_risks: {
        Row: {
          id: string;
          opportunity_id: string;
          risk_name: string;
          risk_level: string;
          description: string | null;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          risk_name: string;
          risk_level?: string;
          description?: string | null;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          risk_name?: string;
          risk_level?: string;
          description?: string | null;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "opportunity_risks_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          }
        ];
      };
      opportunity_payouts: {
        Row: {
          id: string;
          opportunity_id: string;
          cycle_name: string;
          target_profit: string | null;
          actual_profit: string | null;
          status: string;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          cycle_name: string;
          target_profit?: string | null;
          actual_profit?: string | null;
          status?: string;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          cycle_name?: string;
          target_profit?: string | null;
          actual_profit?: string | null;
          status?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "opportunity_payouts_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          }
        ];
      };
      opportunity_legal_checks: {
        Row: {
          id: string;
          opportunity_id: string;
          check_text: string;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          check_text: string;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          check_text?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "opportunity_legal_checks_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          }
        ];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          quote: string;
          created_at: string;
          brand_name: string | null;
          related_opportunity_id: string | null;
          role_title: string | null;
          rating: number | null;
          avatar_url: string | null;
          investment_amount: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          quote: string;
          created_at?: string;
          brand_name?: string | null;
          related_opportunity_id?: string | null;
          role_title?: string | null;
          rating?: number | null;
          avatar_url?: string | null;
          investment_amount?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          quote?: string;
          created_at?: string;
          brand_name?: string | null;
          related_opportunity_id?: string | null;
          role_title?: string | null;
          rating?: number | null;
          avatar_url?: string | null;
          investment_amount?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_related_opportunity_id_fkey";
            columns: ["related_opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          }
        ];
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content_html: string;
          cover_image_url: string | null;
          category_id: string | null;
          status: "draft" | "published";
          author_name: string | null;
          meta_title: string | null;
          meta_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content_html: string;
          cover_image_url?: string | null;
          category_id?: string | null;
          status?: "draft" | "published";
          author_name?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content_html?: string;
          cover_image_url?: string | null;
          category_id?: string | null;
          status?: "draft" | "published";
          author_name?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          status: "pending" | "approved";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          status?: "pending" | "approved";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          status?: "pending" | "approved";
          created_at?: string;
        };
        Relationships: [];
      };
      user_reviews: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          reviewer_name: string;
          reviewer_email: string | null;
          rating: number;
          note: string;
          status: "pending" | "approved" | "rejected";
          target_type: "opportunity" | "homepage" | "general";
          target_id: string | null;
          has_invested: boolean;
          user_identity: string;
          investment_details: string | null;
          admin_note: string | null;
          ip_address: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          reviewer_name?: string;
          reviewer_email?: string | null;
          rating: number;
          note: string;
          status?: "pending" | "approved" | "rejected";
          target_type: "opportunity" | "homepage" | "general";
          target_id?: string | null;
          has_invested?: boolean;
          user_identity?: string;
          investment_details?: string | null;
          admin_note?: string | null;
          ip_address?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          reviewer_name?: string;
          reviewer_email?: string | null;
          rating?: number;
          note?: string;
          status?: "pending" | "approved" | "rejected";
          target_type?: "opportunity" | "homepage" | "general";
          target_id?: string | null;
          has_invested?: boolean;
          user_identity?: string;
          investment_details?: string | null;
          admin_note?: string | null;
          ip_address?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_reviews_target_id_fkey";
            columns: ["target_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          }
        ];
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

export type OpportunityRisk = Database["public"]["Tables"]["opportunity_risks"]["Row"];
export type OpportunityRiskInsert = Database["public"]["Tables"]["opportunity_risks"]["Insert"];

export type OpportunityPayout = Database["public"]["Tables"]["opportunity_payouts"]["Row"];
export type OpportunityPayoutInsert = Database["public"]["Tables"]["opportunity_payouts"]["Insert"];

export type OpportunityLegalCheck = Database["public"]["Tables"]["opportunity_legal_checks"]["Row"];
export type OpportunityLegalCheckInsert = Database["public"]["Tables"]["opportunity_legal_checks"]["Insert"];

export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type TestimonialInsert = Database["public"]["Tables"]["testimonials"]["Insert"];
export type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];

export type BlogCategory = Database["public"]["Tables"]["blog_categories"]["Row"];
export type BlogCategoryInsert = Database["public"]["Tables"]["blog_categories"]["Insert"];
export type BlogCategoryUpdate = Database["public"]["Tables"]["blog_categories"]["Update"];

export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type BlogPostInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];
export type BlogPostUpdate = Database["public"]["Tables"]["blog_posts"]["Update"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type UserReview = Database["public"]["Tables"]["user_reviews"]["Row"];
export type UserReviewInsert = Database["public"]["Tables"]["user_reviews"]["Insert"];
export type UserReviewUpdate = Database["public"]["Tables"]["user_reviews"]["Update"];


