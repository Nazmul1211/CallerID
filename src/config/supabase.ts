import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pisbzazcvsvinmowwvle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpc2J6YXpjdnN2aW5tb3d3dmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjUxODQsImV4cCI6MjA2OTA0MTE4NH0.2KCF4jQTT2H3FZtpbcTqCEDRgWBty30Bc4jwg0mZP_0';

// const supabaseUrl = process.env.SUPABASE_DATABASE_URL || '';
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Disable session persistence for now
    detectSessionInUrl: false,
  },
});

// Database Types
export interface User {
  id: string;
  phone_number: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  phone_number: string;
  name: string;
  email?: string;
  is_spam: boolean;
  spam_reports_count: number;
  created_at: string;
  updated_at: string;
}

export interface SpamReport {
  id: string;
  reporter_user_id: string;
  phone_number: string;
  reason?: string;
  created_at: string;
} 