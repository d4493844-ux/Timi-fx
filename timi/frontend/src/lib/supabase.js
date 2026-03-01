import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  "https://pedbupgjxlcumidwoktc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjc0NTIsImV4cCI6MjA4NzkwMzQ1Mn0.lscyzf9JN82ZihHLD0VC4broyMMfm7WL9MIvXRmwZG8"
);
export default supabase;
