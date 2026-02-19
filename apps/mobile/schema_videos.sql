-- User Exercise Videos Table
-- Stores the user's preferred video for a specific exercise from the library
create table if not exists user_exercise_videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  exercise_name text not null, -- Links to the constant EXERCISES.name
  video_url text not null,
  video_title text,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure one video per exercise per user
  unique(user_id, exercise_name)
);

-- RLS Policies
alter table user_exercise_videos enable row level security;

create policy "Users can view their own videos"
on user_exercise_videos for select
using (auth.uid() = user_id);

create policy "Users can insert their own videos"
on user_exercise_videos for insert
with check (auth.uid() = user_id);

create policy "Users can update their own videos"
on user_exercise_videos for update
using (auth.uid() = user_id);

create policy "Users can delete their own videos"
on user_exercise_videos for delete
using (auth.uid() = user_id);
