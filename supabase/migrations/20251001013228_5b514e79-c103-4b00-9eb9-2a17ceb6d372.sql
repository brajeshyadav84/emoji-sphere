-- Create user roles table for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'parent', 'child');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Groups table with privacy settings
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    privacy TEXT CHECK (privacy IN ('public', 'private')) DEFAULT 'public',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Group members table (must be created before RLS policies that reference it)
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (group_id, user_id)
);

-- Enable RLS on groups table
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups
CREATE POLICY "Public groups are viewable by everyone"
ON public.groups FOR SELECT
USING (privacy = 'public' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can create groups"
ON public.groups FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update groups"
ON public.groups FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete groups"
ON public.groups FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_members
CREATE POLICY "Group members can view their memberships"
ON public.group_members FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage group members"
ON public.group_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 10),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quizzes"
ON public.quizzes FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage quizzes"
ON public.quizzes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Quiz questions table
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage quiz questions"
ON public.quiz_questions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Daily challenges table
CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 10),
    challenge_date DATE NOT NULL,
    points INTEGER DEFAULT 10,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (challenge_date, grade_level)
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
ON public.daily_challenges FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage daily challenges"
ON public.daily_challenges FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Holiday assignments table
CREATE TABLE public.holiday_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 10),
    holiday_type TEXT CHECK (holiday_type IN ('summer', 'winter')) NOT NULL,
    due_date DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.holiday_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active holiday assignments"
ON public.holiday_assignments FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage holiday assignments"
ON public.holiday_assignments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating groups updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();