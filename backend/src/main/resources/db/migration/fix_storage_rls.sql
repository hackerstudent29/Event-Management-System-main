-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable RLS on objects (it should be on, but just in case)
alter table storage.objects enable row level security;

-- 2. Drop existing policies to start fresh (avoids conflicts)
-- Note: This might fail if policies don't exist, so we can ignore errors or use specific names if known.
-- Better to just add a NEW wide-open read policy.

-- 3. Allow Public Read Access (Crucial for <img> tags)
create policy "Public Access Select"
on storage.objects for select
to public
using ( bucket_id = 'event-images' );

-- 4. Allow Authenticated Insert (For uploads)
create policy "Authenticated Insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'event-images' );

-- 5. Allow Authenticated Update/Delete (Optional, for managing files)
create policy "Authenticated Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'event-images' );

create policy "Authenticated Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'event-images' );
