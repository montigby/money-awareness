import { notFound } from "next/navigation";
import type { AssessmentResult } from "@/types/assessment";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resultHeadline } from "@/lib/results/copy";

function topMotivations(result: AssessmentResult) {
  return Object.entries(result.motivations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
}

export default async function SharedProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();

  const { data: reportRow } = await supabase
    .from("generated_reports")
    .select("session_id")
    .eq("public_share_token", token)
    .maybeSingle();

  if (!reportRow) notFound();

  const { data: scoreRow } = await supabase
    .from("assessment_scores")
    .select("result_json")
    .eq("session_id", reportRow.session_id)
    .maybeSingle();

  if (!scoreRow?.result_json) notFound();

  const result = scoreRow.result_json as AssessmentResult;
  const motivations = topMotivations(result);

  return (
    <main className="share-shell">
      <section className="share-card">
        <p className="results-kicker">My Money Profile</p>
        <h1>{resultHeadline(result)}</h1>
        <p className="share-label">Money appears to mean</p>
        <div className="share-motivations">
          <strong>{motivations[0] ?? "Money"}</strong>
          <span>+</span>
          <strong>{motivations[1] ?? "Life"}</strong>
        </div>
        <p className="share-note">
          This public card intentionally leaves out financial context, scores, personal reflection, and private report details.
        </p>
      </section>

      <div className="share-cta">
        <a href="/" className="primary-link">Take the Money Self-Awareness assessment</a>
        <p>A mirror for how money tends to feel and function in your life.</p>
      </div>
    </main>
  );
}
