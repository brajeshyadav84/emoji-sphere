-- Create posts table for group posts
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comment_replies table
CREATE TABLE public.comment_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Users can view posts in their groups"
ON public.posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = posts.group_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create posts in their groups"
ON public.posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = posts.group_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for post_likes
CREATE POLICY "Users can view likes on posts in their groups"
ON public.post_likes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    JOIN public.group_members ON group_members.group_id = posts.group_id
    WHERE posts.id = post_likes.post_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can like posts in their groups"
ON public.post_likes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.posts
    JOIN public.group_members ON group_members.group_id = posts.group_id
    WHERE posts.id = post_likes.post_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can unlike their own likes"
ON public.post_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for post_comments
CREATE POLICY "Users can view comments on posts in their groups"
ON public.post_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    JOIN public.group_members ON group_members.group_id = posts.group_id
    WHERE posts.id = post_comments.post_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can comment on posts in their groups"
ON public.post_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.posts
    JOIN public.group_members ON group_members.group_id = posts.group_id
    WHERE posts.id = post_comments.post_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments"
ON public.post_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.post_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for comment_replies
CREATE POLICY "Users can view replies on comments in their groups"
ON public.comment_replies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.post_comments
    JOIN public.posts ON posts.id = post_comments.post_id
    JOIN public.group_members ON group_members.group_id = posts.group_id
    WHERE post_comments.id = comment_replies.comment_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can reply to comments in their groups"
ON public.comment_replies FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.post_comments
    JOIN public.posts ON posts.id = post_comments.post_id
    JOIN public.group_members ON group_members.group_id = posts.group_id
    WHERE post_comments.id = comment_replies.comment_id
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own replies"
ON public.comment_replies FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
ON public.comment_replies FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating comments
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating replies
CREATE TRIGGER update_replies_updated_at
BEFORE UPDATE ON public.comment_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();