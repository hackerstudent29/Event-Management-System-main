-- Force the bucket to be public in the database settings
-- This overrides the checkbox in the UI if it's out of sync
update storage.buckets
set public = true
where id = 'event-images';

-- Ensure the public policy exists and is correct
-- First, drop it if it exists to avoid duplications/conflicts
drop policy if exists "Public Access Select" on storage.objects;
drop policy if exists "Give me images" on storage.objects;

-- Create the definitive public read policy
create policy "Give me images"
on storage.objects for select
to public
using ( bucket_id = 'event-images' );

-- Ensure uploads are allowed (re-asserting just in case)
drop policy if exists "Authenticated Insert" on storage.objects;
create policy "Authenticated Insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'event-images' );
