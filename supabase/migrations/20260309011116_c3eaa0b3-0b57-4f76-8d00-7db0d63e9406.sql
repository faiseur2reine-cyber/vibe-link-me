-- Update handle_new_user to NOT auto-generate usernames
-- This ensures all users must choose a username via /set-username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    -- Only use metadata username if explicitly provided, otherwise NULL
    NEW.raw_user_meta_data->>'username',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'User'
    )
  );
  RETURN NEW;
END;
$function$;