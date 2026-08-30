create extension if not exists pgcrypto;

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token uuid unique not null default gen_random_uuid(),
  status text not null default 'created'
    check (status in ('created','in_progress','scoring','generating_report','completed','failed')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  current_question integer not null default 1 check (current_question >= 1),
  email text,
  marketing_opt_in boolean not null default false
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  question_code text not null,
  numeric_value numeric,
  text_value text,
  choice_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, question_code),
  check (((numeric_value is not null)::int + (text_value is not null)::int + (choice_value is not null)::int) <= 1)
);

create table if not exists public.assessment_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references public.assessment_sessions(id) on delete cascade,
  result_json jsonb not null,
  scoring_version text not null,
  question_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references public.assessment_sessions(id) on delete cascade,
  slug text unique not null,
  report_json jsonb not null,
  generation_model text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_feedback (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.generated_reports(id) on delete cascade,
  accuracy_rating integer check (accuracy_rating between 1 and 5),
  helpfulness_rating integer check (helpfulness_rating between 1 and 5),
  feedback_text text,
  created_at timestamptz not null default now()
);

create index if not exists idx_answers_session_id on public.answers(session_id);
create index if not exists idx_sessions_token on public.assessment_sessions(session_token);
create index if not exists idx_reports_slug on public.generated_reports(slug);

alter table public.assessment_sessions enable row level security;
alter table public.answers enable row level security;
alter table public.assessment_scores enable row level security;
alter table public.generated_reports enable row level security;
alter table public.report_feedback enable row level security;

revoke all on table public.assessment_sessions from anon, authenticated;
revoke all on table public.answers from anon, authenticated;
revoke all on table public.assessment_scores from anon, authenticated;
revoke all on table public.generated_reports from anon, authenticated;
revoke all on table public.report_feedback from anon, authenticated;

grant all on table public.assessment_sessions to service_role;
grant all on table public.answers to service_role;
grant all on table public.assessment_scores to service_role;
grant all on table public.generated_reports to service_role;
grant all on table public.report_feedback to service_role;
