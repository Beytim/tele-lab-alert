-- Create enum types for status tracking
CREATE TYPE public.test_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'retry');
CREATE TYPE public.department_type AS ENUM ('radiology', 'gi', 'lab', 'cardiology', 'general');
CREATE TYPE public.user_role AS ENUM ('admin', 'doctor', 'technician', 'nurse', 'staff');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'staff',
  department department_type NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE, -- Hospital patient ID
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  telegram_chat_id TEXT UNIQUE, -- For bot notifications
  telegram_username TEXT,
  telegram_connected BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tests table for medical test results
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id TEXT NOT NULL UNIQUE, -- Unique test identifier
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  department department_type NOT NULL,
  test_type TEXT NOT NULL, -- e.g., "X-Ray", "CT Scan", "Blood Test"
  test_name TEXT NOT NULL, -- Specific test name
  status test_status NOT NULL DEFAULT 'pending',
  ordered_by UUID REFERENCES public.profiles(id), -- Doctor who ordered the test
  technician_id UUID REFERENCES public.profiles(id), -- Staff performing test
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_file_url TEXT, -- Path to uploaded result file
  result_summary TEXT,
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=normal, 3=high, 4=urgent
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for tracking all notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'test_ready', 'appointment_reminder', etc.
  status notification_status NOT NULL DEFAULT 'pending',
  telegram_message_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit log for tracking system changes
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for patients (all authenticated users can access)
CREATE POLICY "Authenticated users can view patients" ON public.patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" ON public.patients
  FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for tests
CREATE POLICY "Authenticated users can view tests" ON public.tests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tests" ON public.tests
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tests" ON public.tests
  FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for notifications
CREATE POLICY "Authenticated users can view notifications" ON public.notifications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (true);

-- Create RLS policies for audit logs (read-only for most users)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX idx_patients_telegram_chat_id ON public.patients(telegram_chat_id);
CREATE INDEX idx_tests_patient_id ON public.tests(patient_id);
CREATE INDEX idx_tests_status ON public.tests(status);
CREATE INDEX idx_tests_department ON public.tests(department);
CREATE INDEX idx_notifications_patient_id ON public.notifications(patient_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create function for automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'staff',
    'general'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();