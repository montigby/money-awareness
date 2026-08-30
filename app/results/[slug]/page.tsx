import { notFound } from "next/navigation";
import type { AssessmentResult, DimensionCode } from "@/types/assessment";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ReportSchema, type GeneratedReport } from "@/lib/ai/schema";
import {
  ARCHETYPE_COPY,
  contradictionCopy,
  dimensionInterpretation,
  patternCopy,
  resultHeadline,
} from "@/lib/results/copy";

const DIMENSION_ORDER: DimensionCode[] = [
  "security",
  "enoughness",
  "identityAttachment",
  "control",
  "freedom",
  "presence",
];

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data: session, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("id,status,completed_at")
    .eq("session_token", slug)
    .maybeSingle();

  if (sessionError || !session || session.status !== "completed") notFound();

  const [{ data: scoreRow }, { data: reflectionRow }, { data: reportRow }] = await Promise.all([
    supabase
      .from("assessment_scores")
      .select("result_json,scoring_version,question_version")
      .eq("session_id", session.id)
      .maybeSingle(),
    supabase
      .from("answers")
      .select("text_value")
      .eq("session_id", session.id)
      .eq("question_code", "REF1")
      .maybeSingle(),
    supabase
      .from("generated_reports")
      .select("report_json,generation_model,prompt_version")
      .eq("session_id", session.id)
      .maybeSingle(),
  ]);

  if (!scoreRow?.result_json) notFound();

  const result = scoreRow.result_json as AssessmentResult;
  const parsedReport = reportRow?.report_json
    ? ReportSchema.safeParse(reportRow.report_json)
    : null;
  const report: GeneratedReport | null = parsedReport?.success ? parsedReport.data : null;
  const primary = result.archetypes.primary?.name ?? null;
  const secondary = result.archetypes.secondary?.name ?? null;
  const primaryCopy = primary ? ARCHETYPE_COPY[primary] : null;
  const secondaryCopy = secondary ? ARCHETYPE_COPY[secondary] : null;
  const topPatterns = result.patterns.slice(0, 3);
  const visibleContradictions = result.contradictions.filter((c) => c.confidence !== "low");
  const reflection = reflectionRow?.text_value?.trim() ?? "";

  return (
    <main className="results-shell">
      <header className="results-topbar">
        <a href="/" className="brand-link">Money Self-Awareness</a>
        <span>{report ? "Personalized profile" : "Deterministic profile"}</span>
      </header>

      <section className="results-hero">
        <p className="results-kicker">Your Money Profile</p>
        <p className="profile-type">{resultHeadline(result)}</p>
        <h1>{report?.headline ?? resultHeadline(result)}</h1>
        {report?.profile_summary && <p className="results-deck">{report.profile_summary}</p>}

        {(primaryCopy || secondaryCopy) && (
          <div className="archetype-grid">
            {primaryCopy && (
              <article className="archetype-card archetype-primary">
                <span>Primary</span>
                <h2>{primary}</h2>
                <strong>{primaryCopy.meaning}</strong>
                <p>{primaryCopy.summary}</p>
              </article>
            )}
            {secondaryCopy && (
              <article className="archetype-card">
                <span>Secondary</span>
                <h2>{secondary}</h2>
                <strong>{secondaryCopy.meaning}</strong>
                <p>{secondaryCopy.summary}</p>
              </article>
            )}
          </div>
        )}
      </section>

      {report && (
        <section className="results-section synthesis-section" aria-labelledby="synthesis-heading">
          <p className="results-kicker">The synthesis</p>
          <h2 id="synthesis-heading">What your answers suggest when viewed together</h2>

          <div className="money-means-card">
            <span>Money appears to mean</span>
            <div className="motivation-pair">
              <strong>{report.money_means.primary}</strong>
              <span>+</span>
              <strong>{report.money_means.secondary}</strong>
            </div>
            <p>{report.money_means.interpretation}</p>
          </div>

          <div className="synthesis-grid">
            <article>
              <span>Greatest strength</span>
              <h3>{report.greatest_strength.title}</h3>
              <p>{report.greatest_strength.body}</p>
            </article>
            <article>
              <span>Primary tension</span>
              <h3>{report.primary_tension.title}</h3>
              <p>{report.primary_tension.body}</p>
            </article>
            <article>
              <span>Under financial stress</span>
              <h3>{report.stress_response.title}</h3>
              <p>{report.stress_response.body}</p>
            </article>
          </div>
        </section>
      )}

      <section className="results-section" aria-labelledby="dimensions-heading">
        <div className="section-heading-row">
          <div>
            <p className="results-kicker">Six dimensions</p>
            <h2 id="dimensions-heading">How money tends to feel and function for you</h2>
          </div>
          <p className="section-note">Scores are descriptive, not grades.</p>
        </div>

        <div className="dimension-list">
          {DIMENSION_ORDER.map((code) => {
            const score = result.dimensions[code];
            const copy = dimensionInterpretation(code, score);
            return (
              <details className="dimension-row" key={code}>
                <summary>
                  <div className="dimension-title-row">
                    <span>{copy.label}</span>
                    <strong>{Math.round(score)}</strong>
                  </div>
                  <div className="dimension-track" aria-hidden="true">
                    <div className="dimension-fill" style={{ width: `${Math.max(2, Math.min(100, score))}%` }} />
                  </div>
                  <p>{copy.interpretation}</p>
                </summary>
                <div className="dimension-detail">
                  <p className="dimension-measure"><strong>What this measures:</strong> {copy.description}</p>
                  <div className="dimension-detail-grid">
                    <div>
                      <span>Potential strength</span>
                      <p>{copy.strength}</p>
                    </div>
                    <div>
                      <span>Potential tradeoff</span>
                      <p>{copy.tradeoff}</p>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {topPatterns.length > 0 && (
        <section className="results-section" aria-labelledby="patterns-heading">
          <p className="results-kicker">What stands out</p>
          <h2 id="patterns-heading">Patterns created by combinations of your answers</h2>
          <div className="pattern-grid">
            {topPatterns.map((pattern, index) => {
              const copy = patternCopy(pattern);
              const aiCopy = report?.patterns.find((p) => p.name === copy.title || p.name === pattern.name);
              return (
                <article className="pattern-card" key={pattern.code}>
                  <span className="pattern-number">0{index + 1}</span>
                  <h3>{copy.title}</h3>
                  <p>{aiCopy?.body ?? copy.body}</p>
                  {copy.question && <blockquote>{copy.question}</blockquote>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {result.securityGap !== null && Math.abs(result.securityGap) >= 25 && (
        <section className="results-section reality-section" aria-labelledby="reality-heading">
          <p className="results-kicker">Financial reality gap</p>
          <h2 id="reality-heading">
            {report?.financial_reality.show
              ? report.financial_reality.headline
              : result.securityGap >= 25
                ? "Your financial life appears safer than it feels."
                : "Your confidence appears stronger than your current financial cushion."}
          </h2>
          <div className="reality-comparison">
            <div>
              <span>Objective resilience</span>
              <strong>{Math.round(result.objectiveFinancialResilience ?? 0)}</strong>
            </div>
            <div>
              <span>Internal security</span>
              <strong>{Math.round(result.dimensions.security)}</strong>
            </div>
            <div>
              <span>Gap</span>
              <strong>{result.securityGap > 0 ? "+" : ""}{Math.round(result.securityGap)}</strong>
            </div>
          </div>
          <p className="reality-copy">
            {report?.financial_reality.show
              ? report.financial_reality.body
              : result.securityGap >= 25
                ? "This does not mean you should stop building financial resources. It suggests that objective safety and the feeling of safety may have become partially separate problems."
                : "This can reflect real adaptability and trust in yourself. It may also mean your internal confidence is carrying more of the burden than your current financial buffer."}
          </p>
        </section>
      )}

      {visibleContradictions.length > 0 && (
        <section className="results-section" aria-labelledby="tension-heading">
          <p className="results-kicker">A tension worth noticing</p>
          <h2 id="tension-heading">What you say you value and what you choose are not always identical.</h2>
          <div className="tension-list">
            {visibleContradictions.map((contradiction, index) => {
              const copy = contradictionCopy(contradiction);
              const useAi = index === 0 && report?.contradiction.show;
              return (
                <article key={contradiction.code} className="tension-card">
                  <h3>{useAi ? report.contradiction.title : copy.title}</h3>
                  <p>{useAi ? report.contradiction.body : copy.body}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {reflection && (
        <section className="results-section reflection-result" aria-labelledby="reflection-heading">
          <p className="results-kicker">Your own answer</p>
          <h2 id="reflection-heading">If you already knew you had enough…</h2>
          <blockquote>{reflection}</blockquote>
          <p>
            {report?.reflection_response.show
              ? report.reflection_response.body
              : "Nothing in this section is scored. Your answer is here because it may say something the numbers cannot."}
          </p>
        </section>
      )}

      <section className="results-section closing-question" aria-labelledby="closing-heading">
        <p className="results-kicker">One question to keep</p>
        <h2 id="closing-heading">
          {report?.question_to_consider ?? "What are you still asking money to make true before you allow yourself to feel differently?"}
        </h2>
      </section>

      <footer className="results-footer">
        <p>
          This assessment is for personal reflection and education only. It is not financial, investment, tax, legal, psychological, or medical advice.
        </p>
        <p>
          Scoring {scoreRow.scoring_version} · Questions {scoreRow.question_version}
          {reportRow?.prompt_version ? ` · Narrative ${reportRow.prompt_version}` : ""}
        </p>
      </footer>
    </main>
  );
}
