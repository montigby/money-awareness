alter table public.generated_reports
  add column if not exists public_share_token uuid unique;

create unique index if not exists idx_report_feedback_report_id_unique
  on public.report_feedback(report_id);

create index if not exists idx_generated_reports_public_share_token
  on public.generated_reports(public_share_token);
