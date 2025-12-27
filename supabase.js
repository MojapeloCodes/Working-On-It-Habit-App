// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://bbbgjphjqvvlgscxctni.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiYmdqcGhqcXZ2bGdzY3hjdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MTAzNTEsImV4cCI6MjA4MTI4NjM1MX0.jbywaz_pUk5wuoP2qITQtV9SeVd8FbVXLt-bRByhRbY"
);
