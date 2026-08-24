create extension if not exists pgcrypto;

create table if not exists assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token uuid unique not null default gen_random_uuid(),
  status text not null default 'created'
    check (status in ('created','in_progress','scoring','generating_report','completed','failed')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  current_question integer not null default 1,
  email text,
  marketing_opt_in boolean not null default false
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  question_code text not null,
  numeric_value numeric,
  text_value text,
  choice_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, question_code)
);

create table if not exists assessment_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references assessment_sessions(id) on delete cascade,
  result_json jsonb not null,
  scoring_version text not null,
  question_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists generated_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references assessment_sessions(id) on delete cascade,
  slug text unique not null,
  report_json jsonb not null,
  generation_model text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists report_feedback (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references generated_reports(id) on delete cascade,
  accuracy_rating integer check (accuracy_rating between 1 and 5),
  helpfulness_rating integer check (helpfulness_rating between 1 and 5),
  feedback_text text,
  created_at timestamptz not null default now()
);

create index if not exists idx_answers_session_id on answers(session_id);
create index if not exists idx_reports_slug on generated_reports(slug);

-- RLS should be tightened before production. The intended model is:
-- anonymous browser receives an opaque session token;
-- writes/reads occur via server routes;
-- service-role credentials never reach the browser.
