-- Keep progress monotonic when two devices upsert the same item concurrently.
alter table public.progress_items
  add column if not exists mastered boolean not null default false;

update public.progress_items
set mastered = true
where mastered = false and (mastery_score >= 100 or mastered_at is not null);

create or replace function public.preserve_highest_progress_item()
returns trigger
language plpgsql
as $$
begin
  new.correct := greatest(coalesce(old.correct, 0), coalesce(new.correct, 0));
  new.incorrect := greatest(coalesce(old.incorrect, 0), coalesce(new.incorrect, 0));
  new.streak := greatest(coalesce(old.streak, 0), coalesce(new.streak, 0));
  new.mastery_score := greatest(coalesce(old.mastery_score, 0), coalesce(new.mastery_score, 0));
  new.mastered := coalesce(old.mastered, false) or coalesce(new.mastered, false);
  new.last_trained_at := greatest(old.last_trained_at, new.last_trained_at);
  new.mastered_at := greatest(old.mastered_at, new.mastered_at);
  return new;
end;
$$;

drop trigger if exists progress_items_preserve_highest_progress on public.progress_items;
create trigger progress_items_preserve_highest_progress
before update on public.progress_items
for each row execute function public.preserve_highest_progress_item();
