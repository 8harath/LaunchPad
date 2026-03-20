CREATE TABLE IF NOT EXISTS public.message_conversations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  application_id UUID NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.message_entries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.message_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_conversations_student_id
  ON public.message_conversations(student_id);

CREATE INDEX IF NOT EXISTS idx_message_conversations_company_admin_id
  ON public.message_conversations(company_admin_id);

CREATE INDEX IF NOT EXISTS idx_message_conversations_last_message_at
  ON public.message_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_entries_conversation_id
  ON public.message_entries(conversation_id);

CREATE INDEX IF NOT EXISTS idx_message_entries_created_at
  ON public.message_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_entries_sender_id
  ON public.message_entries(sender_id);

ALTER TABLE public.message_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read conversations" ON public.message_conversations;
CREATE POLICY "Participants can read conversations"
  ON public.message_conversations
  FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = company_admin_id);

DROP POLICY IF EXISTS "Participants can create conversations" ON public.message_conversations;
CREATE POLICY "Participants can create conversations"
  ON public.message_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = student_id OR auth.uid() = company_admin_id);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.message_conversations;
CREATE POLICY "Participants can update conversations"
  ON public.message_conversations
  FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = company_admin_id);

DROP POLICY IF EXISTS "Participants can read messages" ON public.message_entries;
CREATE POLICY "Participants can read messages"
  ON public.message_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.message_conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.student_id OR auth.uid() = c.company_admin_id)
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON public.message_entries;
CREATE POLICY "Participants can send messages"
  ON public.message_entries
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.message_conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.student_id OR auth.uid() = c.company_admin_id)
    )
  );

DROP POLICY IF EXISTS "Participants can update read state" ON public.message_entries;
CREATE POLICY "Participants can update read state"
  ON public.message_entries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.message_conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.student_id OR auth.uid() = c.company_admin_id)
    )
  );
