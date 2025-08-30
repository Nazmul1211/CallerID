// Supabase database operations
import { supabase } from '../config/supabase';
import { User, Contact, SpamReport } from '../config/supabase';

export class DatabaseService {
  async createUser(phoneNumber: string, name: string, email?: string): Promise<User | null> {
    try {
      console.log('DatabaseService: Creating user with phone:', phoneNumber);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            phone_number: phoneNumber,
            name: name,
            email: email,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('DatabaseService: Create user error:', error);
        return null;
      }

      console.log('DatabaseService: User created successfully:', data);
      return data as User;
    } catch (error) {
      console.error('DatabaseService: Create user exception:', error);
      return null;
    }
  }

  async getUserByPhone(phoneNumber: string): Promise<User | null> {
    try {
      console.log('DatabaseService: Getting user by phone:', phoneNumber);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't exist
          console.log('DatabaseService: User not found for phone:', phoneNumber);
          return null;
        }
        console.error('DatabaseService: Get user by phone error:', error);
        return null;
      }

      console.log('DatabaseService: User found:', data);
      return data as User;
    } catch (error) {
      console.error('DatabaseService: Get user by phone exception:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: { name?: string; email?: string }): Promise<User | null> {
    try {
      console.log('DatabaseService: Updating user:', userId, updates);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('DatabaseService: Update user error:', error);
        return null;
      }

      console.log('DatabaseService: User updated successfully:', data);
      return data as User;
    } catch (error) {
      console.error('DatabaseService: Update user exception:', error);
      return null;
    }
  }

  async addContact(userId: string, phoneNumber: string, name: string, email?: string): Promise<Contact | null> {
    try {
      console.log('DatabaseService: Adding contact:', { userId, phoneNumber, name, email });
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([
          {
            user_id: userId,
            phone_number: phoneNumber,
            name: name,
            email: email,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('DatabaseService: Add contact error:', error);
        return null;
      }

      console.log('DatabaseService: Contact added successfully:', data);
      return data as Contact;
    } catch (error) {
      console.error('DatabaseService: Add contact exception:', error);
      return null;
    }
  }

  async getContactsByUser(userId: string): Promise<Contact[]> {
    try {
      console.log('DatabaseService: Getting contacts for user:', userId);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('DatabaseService: Get contacts error:', error);
        return [];
      }

      console.log('DatabaseService: Contacts retrieved:', data?.length || 0);
      return data as Contact[];
    } catch (error) {
      console.error('DatabaseService: Get contacts exception:', error);
      return [];
    }
  }

  async searchContactByPhone(phoneNumber: string): Promise<Contact | null> {
    try {
      console.log('DatabaseService: Searching contact by phone:', phoneNumber);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          console.log('DatabaseService: Contact not found for phone:', phoneNumber);
          return null;
        }
        console.error('DatabaseService: Search contact error:', error);
        return null;
      }

      console.log('DatabaseService: Contact found:', data);
      return data as Contact;
    } catch (error) {
      console.error('DatabaseService: Search contact exception:', error);
      return null;
    }
  }

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
    try {
      console.log('DatabaseService: Updating contact:', contactId, updates);
      
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('DatabaseService: Update contact error:', error);
        return null;
      }

      console.log('DatabaseService: Contact updated successfully:', data);
      return data as Contact;
    } catch (error) {
      console.error('DatabaseService: Update contact exception:', error);
      return null;
    }
  }

  async deleteContact(contactId: string): Promise<boolean> {
    try {
      console.log('DatabaseService: Deleting contact:', contactId);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('DatabaseService: Delete contact error:', error);
        return false;
      }

      console.log('DatabaseService: Contact deleted successfully');
      return true;
    } catch (error) {
      console.error('DatabaseService: Delete contact exception:', error);
      return false;
    }
  }

  async reportSpam(reporterUserId: string, phoneNumber: string, reason: string): Promise<SpamReport | null> {
    try {
      console.log('DatabaseService: Reporting spam:', { reporterUserId, phoneNumber, reason });
      
      // First, add the spam report
      const { data: reportData, error: reportError } = await supabase
        .from('spam_reports')
        .insert([
          {
            reporter_user_id: reporterUserId,
            phone_number: phoneNumber,
            reason: reason,
          }
        ])
        .select()
        .single();

      if (reportError) {
        console.error('DatabaseService: Report spam error:', reportError);
        return null;
      }

      // Update the spam count for the contact
      // First get the current count
      const { data: contactData } = await supabase
        .from('contacts')
        .select('spam_reports_count')
        .eq('phone_number', phoneNumber)
        .single();
      
      if (contactData) {
        const newCount = (contactData.spam_reports_count || 0) + 1;
        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            spam_reports_count: newCount,
            is_spam: true,
            updated_at: new Date().toISOString(),
          })
          .eq('phone_number', phoneNumber);
        
        if (updateError) {
          console.error('DatabaseService: Update spam count error:', updateError);
          // Don't return null here, the report was still created
        }
      }

      console.log('DatabaseService: Spam reported successfully:', reportData);
      return reportData as SpamReport;
    } catch (error) {
      console.error('DatabaseService: Report spam exception:', error);
      return null;
    }
  }

  async getSpamReports(phoneNumber: string): Promise<SpamReport[]> {
    try {
      console.log('DatabaseService: Getting spam reports for:', phoneNumber);
      
      const { data, error } = await supabase
        .from('spam_reports')
        .select('*')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DatabaseService: Get spam reports error:', error);
        return [];
      }

      console.log('DatabaseService: Spam reports retrieved:', data?.length || 0);
      return data as SpamReport[];
    } catch (error) {
      console.error('DatabaseService: Get spam reports exception:', error);
      return [];
    }
  }

  async callerIdLookup(phoneNumber: string): Promise<{
    name?: string;
    isSpam: boolean;
    spamCount: number;
    email?: string;
  }> {
    try {
      console.log('DatabaseService: Caller ID lookup for:', phoneNumber);
      
      // Search in contacts first
      const contact = await this.searchContactByPhone(phoneNumber);
      
      if (contact) {
        console.log('DatabaseService: Contact found in lookup:', contact);
        return {
          name: contact.name,
          isSpam: contact.is_spam || false,
          spamCount: contact.spam_reports_count || 0,
          email: contact.email || undefined,
        };
      }

      // If not found in contacts, check if it's a user in the system
      const user = await this.getUserByPhone(phoneNumber);
      
      if (user) {
        console.log('DatabaseService: User found in lookup:', user);
        // Get spam reports count for this user
        const spamReports = await this.getSpamReports(phoneNumber);
        const spamCount = spamReports.length;
        
        return {
          name: user.name,
          isSpam: spamCount > 0,
          spamCount: spamCount,
          email: user.email || undefined,
        };
      }

      // Check spam reports even if no contact/user found
      const spamReports = await this.getSpamReports(phoneNumber);
      const spamCount = spamReports.length;

      console.log('DatabaseService: No contact/user found, spam reports:', spamCount);
      
      return {
        isSpam: spamCount > 0,
        spamCount: spamCount,
      };
    } catch (error) {
      console.error('DatabaseService: Caller ID lookup exception:', error);
      return {
        isSpam: false,
        spamCount: 0,
      };
    }
  }
}

export const databaseService = new DatabaseService(); 