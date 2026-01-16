package com.eventbooking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class StorageInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        System.out.println("Initializing Supabase Storage Configuration...");
        try {
            // 1. Create Bucket 'event-images'
            // We use ON CONFLICT to ensure idempotency, but we also ensure it's public
            String createBucketSql = "INSERT INTO storage.buckets (id, name, public) " +
                    "VALUES ('event-images', 'event-images', true) " +
                    "ON CONFLICT (id) DO UPDATE SET public = true";
            jdbcTemplate.execute(createBucketSql);
            System.out.println("Storage: Bucket 'event-images' verified/created.");

            // 2. Create Policy for Public Read (Allow everyone to view images)
            // Checks if policy exists first to avoid errors on restart
            String createReadPolicy = "DO $$ " +
                    "BEGIN " +
                    "    IF NOT EXISTS ( " +
                    "        SELECT 1 " +
                    "        FROM pg_policies " +
                    "        WHERE schemaname = 'storage' " +
                    "        AND tablename = 'objects' " +
                    "        AND policyname = 'Public Access event-images' " +
                    "    ) THEN " +
                    "        CREATE POLICY \"Public Access event-images\" " +
                    "        ON storage.objects FOR SELECT " +
                    "        USING ( bucket_id = 'event-images' ); " +
                    "    END IF; " +
                    "END $$;";
            jdbcTemplate.execute(createReadPolicy);

            // 3. Create Policy for Authenticated Uploads (Allow logged-in users to upload)
            // 3. Create Policy for Public Uploads (Allow all users to upload for this MVP)
            // First drop the old restrictive policy if it exists (fix for previous setup)
            jdbcTemplate.execute("DROP POLICY IF EXISTS \"Auth Upload event-images\" ON storage.objects");

            String createUploadPolicy = "DO $$ " +
                    "BEGIN " +
                    "    IF NOT EXISTS ( " +
                    "        SELECT 1 " +
                    "        FROM pg_policies " +
                    "        WHERE schemaname = 'storage' " +
                    "        AND tablename = 'objects' " +
                    "        AND policyname = 'Public Upload event-images' " +
                    "    ) THEN " +
                    "        CREATE POLICY \"Public Upload event-images\" " +
                    "        ON storage.objects FOR INSERT " +
                    "        WITH CHECK ( bucket_id = 'event-images' ); " +
                    "    END IF; " +
                    "END $$;";
            jdbcTemplate.execute(createUploadPolicy);

            System.out.println("Storage: Policies configured successfully.");

        } catch (Exception e) {
            // Log error but allow app to continue (maybe bucket already exists or
            // permissions issue)
            System.err.println("Storage Initialization Warning: " + e.getMessage());
        }
    }
}
