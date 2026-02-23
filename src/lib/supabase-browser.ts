'use client';

import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgdhnkfxberjzctgywiz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZGhua2Z4YmVyanpjdGd5d2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjIwNTcsImV4cCI6MjA4NjgzODA1N30.QO998oDHtNIy9xLzIbLt84v03i9b6dUw8vPpN3cN11Y';

export function createSupabaseBrowser() {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
