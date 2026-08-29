create table if not exists public.grammar_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text not null,
  lesson_id text not null,
  part_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, track_id, lesson_id, part_id)
);

create index if not exists grammar_completions_user_id_idx
  on public.grammar_completions(user_id);

alter table public.grammar_completions enable row level security;

drop policy if exists "Users can read their grammar completions" on public.grammar_completions;
create policy "Users can read their grammar completions"
  on public.grammar_completions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their grammar completions" on public.grammar_completions;
create policy "Users can insert their grammar completions"
  on public.grammar_completions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their grammar completions" on public.grammar_completions;
create policy "Users can update their grammar completions"
  on public.grammar_completions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their grammar completions" on public.grammar_completions;
create policy "Users can delete their grammar completions"
  on public.grammar_completions for delete
  using (auth.uid() = user_id);

create or replace function public.preserve_grammar_completion_date()
returns trigger
language plpgsql
as $$
begin
  new.completed_at := greatest(old.completed_at, new.completed_at);
  return new;
end;
$$;

drop trigger if exists grammar_completions_preserve_date on public.grammar_completions;
create trigger grammar_completions_preserve_date
before update on public.grammar_completions
for each row execute function public.preserve_grammar_completion_date();
