"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/assessment/questions";
import { FINANCIAL_OPTIONS } from "@/lib/assessment/answer-validation";
import type { AnswerValue, AssessmentAnswers, Question } from "@/types/assessment";

const STORAGE_PREFIX = "money-awareness:v1:";
const TRANSITION_MS = 220;

type StoredState = {
  answers: AssessmentAnswers;
  currentIndex: number;
  updatedAt: string;
};

type ServerState = {
  status: string;
  currentIndex: number;
  answers: AssessmentAnswers;
};

function storageKey(session: string) {
  return `${STORAGE_PREFIX}${session}`;
}

function getOptions(question: Question) {
  return question.options ?? FINANCIAL_OPTIONS[question.code] ?? [];
}

function isAnswered(question: Question, answer: AnswerValue | undefined) {
  if (question.required === false) return true;
  return answer !== undefined && answer !== null && answer !== "";
}

export function AssessmentFlow({ session }: { session: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = QUESTIONS;
  const question = questions[currentIndex];
  const answer = answers[question.code];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.code] !== undefined && answers[q.code] !== null && answers[q.code] !== "").length,
    [answers, questions]
  );

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      let local: StoredState | null = null;
      try {
        const raw = localStorage.getItem(storageKey(session));
        if (raw) local = JSON.parse(raw) as StoredState;
      } catch {
        localStorage.removeItem(storageKey(session));
      }

      let server: ServerState | null = null;
      try {
        const response = await fetch(`/api/assessment/${session}`, { cache: "no-store" });
        if (response.ok) server = (await response.json()) as ServerState;
        else if (response.status === 404) {
          if (!cancelled) router.replace("/");
          return;
        }
      } catch {
        // Local cache remains available during temporary network failure.
      }

      if (cancelled) return;

      if (server?.status === "completed") {
        router.replace(`/results/${session}`);
        return;
      }

      const mergedAnswers = { ...(server?.answers ?? {}), ...(local?.answers ?? {}) };
      const safeIndex = Math.max(
        0,
        Math.min(Math.max(server?.currentIndex ?? 0, local?.currentIndex ?? 0), questions.length - 1)
      );
      setAnswers(mergedAnswers);
      setCurrentIndex(safeIndex);
      setHydrated(true);

      // Replay any device-only answers that failed to reach the server earlier.
      if (local && server) {
        for (const [questionCode, value] of Object.entries(local.answers)) {
          if (server.answers[questionCode] === value) continue;
          void fetch(`/api/assessment/${session}/answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionCode, value }),
          });
        }
      }
    }

    void restore();
    return () => { cancelled = true; };
  }, [router, session, questions.length]);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { answers, currentIndex, updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey(session), JSON.stringify(state));
  }, [answers, currentIndex, hydrated, session]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const goNext = useCallback(() => {
    if (!isAnswered(question, answer) || currentIndex >= questions.length - 1) return;
    setDirection("forward");
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [answer, currentIndex, question, questions.length]);

  const goBack = useCallback(() => {
    if (currentIndex === 0) return;
    setDirection("back");
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [currentIndex]);

  const saveAnswer = useCallback(
    (value: AnswerValue, autoAdvance = true) => {
      setAnswers((prev) => ({ ...prev, [question.code]: value }));
      setSaving(true);
      setSaveError(false);

      if (autoAdvance && question.code !== "REF1") {
        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        transitionTimer.current = setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setDirection("forward");
            setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
          }
        }, TRANSITION_MS);
      }

      void fetch(`/api/assessment/${session}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionCode: question.code, value }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Autosave failed");
          setSaveError(false);
        })
        .catch(() => setSaveError(true))
        .finally(() => setSaving(false));
    },
    [currentIndex, question.code, questions.length, session]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA" || target?.tagName === "INPUT") return;
      if (event.key === "ArrowLeft") { event.preventDefault(); goBack(); return; }
      if (event.key === "ArrowRight" || event.key === "Enter") { event.preventDefault(); goNext(); return; }
      if (question.type === "likert" && /^[1-7]$/.test(event.key)) {
        event.preventDefault(); saveAnswer(Number(event.key), true); return;
      }
      const options = getOptions(question);
      const optionIndex = Number(event.key) - 1;
      if ((question.type === "single_choice" || (question.type === "financial_context" && question.code !== "FIN4")) &&
          Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < options.length) {
        event.preventDefault(); saveAnswer(options[optionIndex].id, true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goNext, question, saveAnswer]);

  async function finishAssessment() {
    const missing = questions.filter((q) => q.required && !isAnswered(q, answers[q.code]));
    if (missing.length > 0) {
      setCurrentIndex(questions.findIndex((q) => q.code === missing[0].code));
      return;
    }

    // Give any in-flight autosave a brief opportunity to finish before the
    // server reloads authoritative answers for scoring.
    if (saving) await new Promise((resolve) => setTimeout(resolve, 350));

    const response = await fetch(`/api/assessment/${session}/complete`, { method: "POST" });
    if (response.ok) {
      localStorage.setItem(`${storageKey(session)}:complete`, "true");
      router.push(`/results/${session}`);
    } else {
      setSaveError(true);
    }
  }

  if (!hydrated) {
    return <main className="assessment-shell assessment-loading" aria-live="polite"><p>Restoring your assessment…</p></main>;
  }

  return (
    <main className="assessment-shell">
      <header className="assessment-header">
        <a href="/" className="brand-link">Money Self-Awareness</a>
        <div className="progress-copy" aria-live="polite">{currentIndex + 1} of {questions.length}</div>
      </header>
      <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <section className={`question-stage question-stage-${direction}`} key={question.code} aria-labelledby="question-title">
        <div className="question-meta"><span>{sectionLabel(question.code)}</span>{!question.required && <span>Optional</span>}</div>
        <h1 id="question-title">{question.text}</h1>
        {question.type === "likert" && <LikertQuestion value={typeof answer === "number" ? answer : null} onSelect={(v) => saveAnswer(v)} />}
        {(question.type === "single_choice" || (question.type === "financial_context" && question.code !== "FIN4")) &&
          <ChoiceQuestion options={getOptions(question)} value={typeof answer === "string" ? answer : null} onSelect={(v) => saveAnswer(v)} />}
        {question.code === "FIN4" && <BurdenScale value={typeof answer === "number" ? answer : null} onSelect={(v) => saveAnswer(v)} />}
        {question.type === "free_text" && <ReflectionQuestion value={typeof answer === "string" ? answer : ""} onChange={(v) => saveAnswer(v, false)} />}
        <div className="question-footer">
          <button className="text-button" type="button" onClick={goBack} disabled={currentIndex === 0}>← Back</button>
          <div className="save-state" aria-live="polite">{saving ? "Saving…" : saveError ? "Saved on this device" : "Saved"}</div>
          {currentIndex === questions.length - 1 ? (
            <button className="primary-button" type="button" onClick={() => void finishAssessment()}>See my profile</button>
          ) : question.required === false ? (
            <button className="text-button text-button-strong" type="button" onClick={goNext}>{answer ? "Continue →" : "Skip →"}</button>
          ) : (
            <button className="text-button text-button-strong" type="button" onClick={goNext} disabled={!isAnswered(question, answer)}>Continue →</button>
          )}
        </div>
      </section>
      <footer className="assessment-bottom"><span>{answeredCount} answered</span><span className="desktop-hint">Keys 1–7 answer · ← → navigate</span></footer>
    </main>
  );
}

function LikertQuestion({ value, onSelect }: { value: number | null; onSelect: (value: number) => void }) {
  return <div className="likert-wrap"><div className="likert-endpoints" aria-hidden="true"><span>Strongly disagree</span><span>Strongly agree</span></div><div className="likert-grid" role="radiogroup" aria-label="Agreement scale">{[1,2,3,4,5,6,7].map((n) => <button key={n} type="button" className={`likert-button ${value === n ? "selected" : ""}`} role="radio" aria-checked={value === n} aria-label={`${n} of 7`} onClick={() => onSelect(n)}><span>{n}</span></button>)}</div><div className="likert-mobile-labels" aria-hidden="true"><span>Disagree</span><span>Neutral</span><span>Agree</span></div></div>;
}

function ChoiceQuestion({ options, value, onSelect }: { options: { id: string; text: string }[]; value: string | null; onSelect: (value: string) => void }) {
  return <div className="choice-list" role="radiogroup">{options.map((option, index) => <button type="button" role="radio" aria-checked={value === option.id} className={`choice-card ${value === option.id ? "selected" : ""}`} key={option.id} onClick={() => onSelect(option.id)}><span className="choice-key">{index + 1}</span><span>{option.text}</span></button>)}</div>;
}

function BurdenScale({ value, onSelect }: { value: number | null; onSelect: (value: number) => void }) {
  return <div className="burden-wrap"><div className="burden-labels"><span>Not burdensome</span><span>Extremely burdensome</span></div><div className="burden-grid" role="radiogroup" aria-label="Financial obligation burden from 0 to 10">{Array.from({ length: 11 }, (_, n) => <button type="button" role="radio" aria-checked={value === n} className={`burden-button ${value === n ? "selected" : ""}`} key={n} onClick={() => onSelect(n)}>{n}</button>)}</div></div>;
}

function ReflectionQuestion({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div><textarea className="reflection-input" value={value} maxLength={1000} rows={7} placeholder="Write whatever comes to mind…" onChange={(event) => onChange(event.target.value)} /><div className="character-count">{value.length}/1000</div></div>;
}

function sectionLabel(code: string) {
  if (code.startsWith("SEC")) return "Money & safety";
  if (code.startsWith("ENO") || code.startsWith("IDN")) return "Money & self";
  if (code.startsWith("CTL")) return "Money & certainty";
  if (code.startsWith("FRE") || code.startsWith("PRE")) return "Money & life";
  if (code.startsWith("ATT")) return "Money & attention";
  if (code.startsWith("SCN")) return "A few real-world choices";
  if (code.startsWith("FIN")) return "Financial context";
  return "Final reflection";
}
