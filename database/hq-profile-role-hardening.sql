-- Dedicated HQ only. Preserve existing self-profile RLS.
begin;
revoke update on hq.profiles from authenticated;
revoke update(id,role,created_at) on hq.profiles from authenticated;
grant update(display_name,avatar) on hq.profiles to authenticated;
do $$
begin
 if has_column_privilege('authenticated','hq.profiles','role','UPDATE')
 or has_column_privilege('authenticated','hq.profiles','id','UPDATE') then
 raise exception 'Account identity or role remains writable';
 end if;
 if not has_column_privilege('authenticated','hq.profiles','display_name','UPDATE')
 or not has_column_privilege('authenticated','hq.profiles','avatar','UPDATE') then
 raise exception 'Profile editing unexpectedly disabled';
 end if;
end $$;
commit;
-- Review any existing role-changing RPCs and admin UI dependencies separately.
