-- Make sure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = true;

-- Enable RLS on the bucket (optional but good practice, though we just want it to work first)
-- create policy "Public Access"
-- on storage.objects for select
-- using ( bucket_id = 'event-images' );

-- Note: In Supabase Dashboard -> Storage -> event-images -> Configuration
-- Ensure "Public Bucket" is toggled ON.
