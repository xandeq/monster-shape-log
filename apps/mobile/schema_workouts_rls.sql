-- Enable RLS for Workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Policies for Workouts
CREATE POLICY "Users can view their own workouts."
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts."
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts."
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts."
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for Workout Exercises (if not already)
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for Workout Exercises
CREATE POLICY "Users can view their own workout exercises."
  ON public.workout_exercises FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout exercises."
  ON public.workout_exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout exercises."
  ON public.workout_exercises FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout exercises."
  ON public.workout_exercises FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for Workout Sets (if not already)
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Policies for Workout Sets
CREATE POLICY "Users can view their own workout sets."
  ON public.workout_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout sets."
  ON public.workout_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sets."
  ON public.workout_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sets."
  ON public.workout_sets FOR DELETE
  USING (auth.uid() = user_id);
