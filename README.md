# CallerID - TrueCaller Clone

A React Native app that functions as a TrueCaller clone, allowing users to identify unknown callers and manage contacts with spam detection capabilities.

## Features

- **User Registration**: Simple phone number-based signup
- **Caller ID Search**: Look up phone numbers to identify callers
- **Contact Management**: Add, edit, and delete contacts
- **Spam Detection**: Community-driven spam reporting system
- **Cross-platform**: Works on both iOS and Android

## Tech Stack

- React Native 0.80.1
- Supabase (Database & Backend)
- React Navigation 6 (Navigation)
- TypeScript (Type Safety)
- AsyncStorage (Local Data Persistence)

## Project Structure

```
CallerID/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Supabase client configuration
│   ├── context/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Main navigation setup
│   ├── screens/
│   │   ├── AuthScreen.tsx       # User registration/login
│   │   ├── HomeScreen.tsx       # Caller ID search
│   │   ├── ContactsScreen.tsx   # Contact management
│   │   ├── ProfileScreen.tsx    # User profile
│   │   └── AddContactScreen.tsx # Add new contacts
│   └── services/
│       └── database.ts          # Database CRUD operations
├── App.tsx                      # Main app component
└── package.json
```


## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the API settings
3. Update `src/config/supabase.ts` with your actual Supabase credentials:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_ANON_KEY';
```

### 3. Database Schema

Run these SQL commands in your Supabase SQL Editor to create the required tables:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_spam BOOLEAN DEFAULT FALSE,
  spam_reports_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

-- Create spam_reports table
CREATE TABLE IF NOT EXISTS spam_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_spam_reports_phone_number ON spam_reports(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Create function to increment spam count
CREATE OR REPLACE FUNCTION increment_spam_count(phone_num VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE contacts 
  SET spam_reports_count = spam_reports_count + 1,
      is_spam = CASE WHEN spam_reports_count + 1 > 2 THEN TRUE ELSE is_spam END
  WHERE phone_number = phone_num;
END;
$$ LANGUAGE plpgsql;
```

### 4. iOS Setup (if running on iOS)

```bash
cd ios && pod install && cd ..
```

### 5. Run the App

For Android:
```bash
npm run android
```

For iOS:
```bash
npm run ios
```

## Features Overview

### Authentication
- Phone number-based registration
- Automatic user creation/login
- Persistent authentication state

### Caller ID Search
- Search any phone number
- Display caller information from community database
- Show spam status and reports count
- Clean, intuitive search interface

### Contact Management
- Add contacts with phone number, name, and email
- View all your contacts
- Delete contacts
- Report contacts as spam

### Spam Detection
- Community-driven spam reporting
- Automatic spam detection based on report threshold
- Visual indicators for spam numbers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@callerid.app or create an issue in the repository.
