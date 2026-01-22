-- Create tables for AI Advisor functionality
-- 1. Store farm problems reported by users
CREATE TABLE IF NOT EXISTS public.advisor_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sector VARCHAR(20) NOT NULL,
    question TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 2. Store AI-generated solutions
CREATE TABLE IF NOT EXISTS public.advisor_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES public.advisor_queries(id) ON DELETE CASCADE,
    solution_text TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 3. Solution Archive for future reuse (problem -> solution mapping)
CREATE TABLE IF NOT EXISTS public.solution_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_keywords TEXT [] NOT NULL,
    sector VARCHAR(20) NOT NULL,
    solution_text TEXT NOT NULL,
    acceptance_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 4. Track daily usage for free tier limiting
CREATE TABLE IF NOT EXISTS public.advisor_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE NOT NULL,
    query_count INT DEFAULT 0,
    UNIQUE(user_id, usage_date)
);
-- Enable RLS
ALTER TABLE public.advisor_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_usage ENABLE ROW LEVEL SECURITY;
-- RLS Policies
-- advisor_queries: Users can only see and create their own queries
CREATE POLICY "Users can create their own advisor queries" ON public.advisor_queries FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own advisor queries" ON public.advisor_queries FOR
SELECT TO authenticated USING (auth.uid() = user_id);
-- advisor_solutions: Users can view solutions to their own queries
CREATE POLICY "Users can view solutions for their queries" ON public.advisor_solutions FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.advisor_queries
            WHERE public.advisor_queries.id = public.advisor_solutions.query_id
                AND public.advisor_queries.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update acceptance of their own solutions" ON public.advisor_solutions FOR
UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.advisor_queries
            WHERE public.advisor_queries.id = public.advisor_solutions.query_id
                AND public.advisor_queries.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.advisor_queries
            WHERE public.advisor_queries.id = public.advisor_solutions.query_id
                AND public.advisor_queries.user_id = auth.uid()
        )
    );
-- solution_archive: All authenticated users can read, but nobody can write directly (intended for system/triggers)
CREATE POLICY "Authenticated users can view archived solutions" ON public.solution_archive FOR
SELECT TO authenticated USING (true);
-- advisor_usage: Users can only see and manage their own usage tracking
CREATE POLICY "Users can view their own usage" ON public.advisor_usage FOR
SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own usage records" ON public.advisor_usage FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own usage count" ON public.advisor_usage FOR
UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);