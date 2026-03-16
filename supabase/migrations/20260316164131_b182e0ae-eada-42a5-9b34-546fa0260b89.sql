
-- Trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget NUMERIC DEFAULT 0,
  color TEXT DEFAULT '#1D9E75',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own trips" ON public.trips FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trip members (for sharing)
CREATE TABLE public.trip_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  initials TEXT,
  color TEXT DEFAULT '#D3D1C7',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members visible to trip owner" ON public.trip_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()));

-- Activities / itinerary
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  activity_date DATE,
  start_time TIME,
  end_time TIME,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities visible to trip owner" ON public.activities FOR ALL
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()));

-- Expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  amount NUMERIC NOT NULL DEFAULT 0,
  paid_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expenses visible to trip owner" ON public.expenses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()));

-- Checklist items
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  list_type TEXT NOT NULL DEFAULT 'checklist',
  assigned_to TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Checklist visible to trip owner" ON public.checklist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()));

-- Comments
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments visible to trip owner" ON public.comments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
