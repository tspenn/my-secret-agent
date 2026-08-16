/*
  # Secret Agent free tier id for shared profiles

  Shared Skyland `profiles.tier` defaults to FRIDAY's `support`.
  New signups from My Secret Agent pass `raw_user_meta_data.signup_app = 'secret-agent'`
  and receive `tier = 'sa_free'` so they are queryable separately in Supabase.

  Display label in the app remains "Free". Paid tiers stay `agent` / `network`.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  signup_app text := coalesce(new.raw_user_meta_data->>'signup_app', '');
  initial_tier text := 'support';
begin
  if signup_app = 'secret-agent' then
    initial_tier := 'sa_free';
  end if;

  insert into public.profiles (id, email, tier)
  values (new.id, new.email, initial_tier)
  on conflict (id) do nothing;

  return new;
end;
$$;
