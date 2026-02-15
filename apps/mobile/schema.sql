-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workouts Table
create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  date timestamptz default now(),
  duration integer default 0,
  created_at timestamptz default now()
);

-- Workout Exercises Table
create table if not exists workout_exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references workouts(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Workout Sets Table
create table if not exists workout_sets (
  id uuid primary key default uuid_generate_v4(),
  exercise_id uuid references workout_exercises(id) on delete cascade,
  weight text,
  reps text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Measurements Table
create table if not exists measurements (
  id uuid primary key default uuid_generate_v4(),
  date timestamptz default now(),
  weight numeric,
  body_fat numeric,
  created_at timestamptz default now()
);

-- Photos Table
create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  date timestamptz default now(),
  uri text not null,
  label text,
  created_at timestamptz default now()
);
