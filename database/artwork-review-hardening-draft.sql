-- Apply after artwork-submissions-draft.sql, in staging first.
begin;
create function butterflii.stamp_artwork_review()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status <> 'pending' or new.status not in ('approved','changes_requested') then
    raise exception 'Invalid review transition';
  end if;
  new.reviewed_by := auth.uid();
  new.reviewed_at := statement_timestamp();
  return new;
end;
$$;
revoke all on function butterflii.stamp_artwork_review() from public, anon, authenticated;
create trigger stamp_artwork_review
before update on butterflii.artwork_submissions
for each row execute function butterflii.stamp_artwork_review();
revoke update (reviewed_by,reviewed_at) on butterflii.artwork_submissions from authenticated;
commit;
-- Existing parent-only RLS remains authoritative.
-- Client updates only status and review_note; trigger stamps identity and time.
-- No publication or inventory changes.
