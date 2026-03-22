
CREATE OR REPLACE FUNCTION public.get_trip_info_for_invitation(_trip_id uuid)
RETURNS TABLE(trip_name text, trip_destination text, owner_name text, owner_email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.name AS trip_name,
    t.destination AS trip_destination,
    COALESCE(m.name, 'Unknown') AS owner_name,
    COALESCE(m.email, '') AS owner_email
  FROM public.trips t
  LEFT JOIN public.trip_members m ON m.trip_id = t.id AND m.role = 'owner'
  WHERE t.id = _trip_id
  LIMIT 1;
$$;
