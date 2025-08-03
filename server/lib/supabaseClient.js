
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://hgfuuiwrgapjxtvdjxow.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZnV1aXdyZ2Fwanh0dmRqeG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTYwODEsImV4cCI6MjA2ODgzMjA4MX0.pMt9rjCXENVD7cf0drtfUjiQgQw3TmZUb7GpdI45TeU";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
