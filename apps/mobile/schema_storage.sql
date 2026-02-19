-- Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- Policy: Allow public to view avatars (Read Access)
create policy "Public Avatars are viewable by everyone"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Policy: Allow authenticated users to upload avatars (Insert Access)
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow users to update their own avatar (Update Access)
create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Policy: Allow users to delete their own avatar (Delete Access)
create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);
