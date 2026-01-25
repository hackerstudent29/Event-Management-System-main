-- RUN THIS IN SUPABASE SQL EDITOR
-- This script completely resets policies for the 'event-images' bucket 
-- to ensure NO permissions are blocking your images.

-- 1. Ensure bucket is public
update storage.buckets set public = true where id = 'event-images';

-- 2. Delete ALL existing policies for this bucket to avoid conflicts
delete from storage.policies where bucket_id = 'event-images';

-- 3. Policy: ALLOW PUBLIC TO SEE IMAGES (The most important one)
create policy "public_view"
on storage.objects for select
to public
using ( bucket_id = 'event-images' );

-- 4. Policy: ALLOW ANYONE TO UPLOAD (For testing - safely restricted later)
-- Note: 'anon' is the unauthenticated user role.
create policy "public_insert"
on storage.objects for insert
to public
with check ( bucket_id = 'event-images' );

-- 5. Policy: ALLOW AUTHENTICATED USERS TO MANAGE
create policy "auth_all"
on storage.objects for all
to authenticated
using ( bucket_id = 'event-images' )
with check ( bucket_id = 'event-images' );
