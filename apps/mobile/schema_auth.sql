-- 1. Add user_id to tables
alter table workouts add column user_id uuid references auth.users(id);
alter table workout_exercises add column user_id uuid references auth.users(id);
alter table workout_sets add column user_id uuid references auth.users(id);
alter table measurements add column user_id uuid references auth.users(id);
alter table photos add column user_id uuid references auth.users(id);

-- 2. Enable RLS
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sets enable row level security;
alter table measurements enable row level security;
alter table photos enable row level security;

-- 3. Create Policies

-- Workouts
create policy "Users can only access their own workouts"
on workouts for all
using (auth.uid() = user_id);

-- Workout Exercises
create policy "Users can only access their own exercises"
on workout_exercises for all
using (auth.uid() = user_id);

-- Workout Sets
create policy "Users can only access their own sets"
on workout_sets for all
using (auth.uid() = user_id);

-- Measurements
create policy "Users can only access their own measurements"
on measurements for all
using (auth.uid() = user_id);

-- Photos
create policy "Users can only access their own photos"
on photos for all
using (auth.uid() = user_id);
