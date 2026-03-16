ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'reviewed';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'shortlisted';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'interview_scheduled';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'applied';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'under_review';

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.company_reviews (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  review TEXT NOT NULL,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  story TEXT NOT NULL,
  advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.hiring_insights (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  takeaway TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON public.messages(application_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON public.company_reviews(company_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_insights ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Recipients can update read state" ON public.messages FOR UPDATE USING (
    auth.uid() = recipient_id OR auth.uid() = sender_id
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read company reviews" ON public.company_reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read success stories" ON public.success_stories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can read hiring insights" ON public.hiring_insights FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
