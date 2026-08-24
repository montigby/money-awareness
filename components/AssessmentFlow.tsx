"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/lib/assessment/questions";
import type { AnswerValue, AssessmentAnswers, Question } from "@/types/assessment";

const STORAGE_PREFIX = "money-awareness:v1:";
const TRANSITION_MS = 220;

const FINANCIAL_OPTIONS: Record<string, { id: string; text: string }[]> = {
  FIN1: [
    { id: "<50k", text: "Under $50,000" },
    { id: "50-100k", text: "$50,000–$100,000" },
    { id: "100-200k", text: "$100,000–$200,000" },
    { id: "200-500k", text: "$200,000–$500,000" },
    { id: "500k-1m", text: "$500,000–$1 million" },
    { id: "1m+", text: "$1 million+" },
  ],
  FIN2: [
    { id: "negative", text: "Negative" },
    { id: "0-100k", text: "$0–$100,000" },
    { id: "100-500k", text: "$100,000–$500,000" },
    { id: "500k-1m", text: "$500,000–$1 million" },
    { id: "1m-3m", text: "$1–$3 million" },
    { id: "3m-10m", text: "$3–$10 million" },
    { id: "10m+", text: "$10 million+" },
  ],
  FIN3: [
    { id: "<1m", text: "Less than 1 month" },
    { id: "1-3m", text: "1–3 months" },
    { id: "3-6m", text: "3–6 months" },
    { id: "6-12m", text: "6–12 months" },
    { id: "1-3y", text: "1–3 years" },
    { id: "3y+", text: "3+ years" },
  ],
};

type StoredState = {
  answers: AssessmentAnswers;
  currentIndex: number;
  updatedAt: string;
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
    try {
      const raw = localStorage.getItem(storageKey(session));
      if (raw) {
        const stored = JSON.parse(raw) as StoredState;
        setAnswers(stored.answers ?? {});
        const safeIndex = Math.max(0, Math.min(stored.currentIndex ?? 0, questions.length - 1));
        setCurrentIndex(safeIndex);
      }
    } catch {
      localStorage.removeItem(storageKey(session));
    } finally {
      setHydrated(true);
    }
  }, [session, questions.length]);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = {
      answers,
      currentIndex,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey(session), JSON.stringify(state));
  }, [answers, currentIndex, hydrated, session]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  const goNext = useCallback(() => {
    if (!isAnswered(question, answer)) return;
    if (currentIndex >= questions.length - 1) return;
    setDirection("forward");
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [answer, currentIndex, question, questions.length]);

  const goBack = useCallback(() => {
    if (currentIndex === 0) return;
    setDirection("back");
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [currentIndex]);

  const saveAnswer = useCallback(
    async (value: AnswerValue, autoAdvance = true) => {
      setAnswers((prev) => ({ ...prev, [question.code]: value }));
      setSaving(true);
      setSaveError(false);

      try {
        const response = await fetch(`/api/assessment/${session}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionCode: question.code, value }),
        });
        if (!response.ok) throw new Error("Autosave failed");
      } catch {
        // Local storage remains the Stage 3 source of resilience. Stage 4 will
        // make server persistence authoritative.
        setSaveError(true);
      } finally {
        setSaving(false);
      }

      if (autoAdvance && question.code !== "REF1") {
        if (transitionTimer.current) clearTimeout(transitionTimer.current);
        transitionTimer.current = setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            setDirection("forward");
            setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
          }
        }, TRANSITION_MS);
      }
    },
    [currentIndex, question.code, questions.length, session]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "TEXTAREA" || target?.tagName === "INPUT") return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        goNext();
        return;
      }

      if (question.type === "likert" && /^[1-7]$/.test(event.key)) {
        event.preventDefault();
        void saveAnswer(Number(event.key), true);
      }

      const options = getOptions(question);
      const optionIndex = Number(event.key) - 1;
      if (
        (question.type === "single_choice" || (question.type === "financial_context" && question.code !== "FIN4")) &&
        Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < options.length
      ) {
        event.preventDefault();
        void saveAnswer(options[optionIndex].id, true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goNext, question, saveAnswer]);

  async function finishAssessment() {
    const missing = questions.filter((q) => q.required && !isAnswered(q, answers[q.code]));
    if (missing.length > 0) {
      const firstMissing = questions.findIndex((q) => q.code === missing[0].code);
      setCurrentIndex(firstMissing);
      return;
    }

    const response = await fetch(`/api/assessment/${session}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (response.ok) {
      localStorage.setItem(`${storageKey(session)}:complete`, "true");
      router.push(`/results/${session}`);
    }
  }

  if (!hydrated) {
    return (
      <main className="assessment-shell assessment-loading" aria-live="polite">
        <p>Restoring your assessment…</p>
      </main>
    );
  }

  return (
    <main className="assessment-shell">
      <header className="assessment-header">
        <a href="/" className="brand-link">Money Self-Awareness</a>
        <div className="progress-copy" aria-live="polite">
          {currentIndex + 1} of {questions.length}
        </div>
      </header>

      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <section
        className={`question-stage question-stage-${direction}`}
        key={question.code}
        aria-labelledby="question-title"
      >
        <div className="question-meta">
          <span>{sectionLabel(question.code)}</span>
          {!question.required && <span>Optional</span>}
        </div>

        <h1 id="question-title">{question.text}</h1>

        {question.type === "likert" && (
          <LikertQuestion value={typeof answer === "number" ? answer : null} onSelect={(v) => void saveAnswer(v)} />
        )}

        {(question.type === "single_choice" || (question.type === "financial_context" && question.code !== "FIN4")) && (
          <ChoiceQuestion
            options={getOptions(question)}
            value={typeof answer === "string" ? answer : null}
            onSelect={(v) => void saveAnswer(v)}
          />
        )}

        {question.code === "FIN4" && (
          <BurdenScale value={typeof answer === "number" ? answer : null} onSelect={(v) => void saveAnswer(v)} />
        )}

        {question.type === "free_text" && (
          <ReflectionQuestion
            value={typeof answer === "string" ? answer : ""}
            onChange={(v) => void saveAnswer(v, false)}
          />
        )}

        <div className="question-footer">
          <button className="text-button" type="button" onClick={goBack} disabled={currentIndex === 0}>
            ← Back
          </button>

          <div className="save-state" aria-live="polite">
            {saving ? "Saving…" : saveError ? "Saved on this device" : "Saved"}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button className="primary-button" type="button" onClick={() => void finishAssessment()}>
              See my profile
            </button>
          ) : question.required === false ? (
            <button className="text-button text-button-strong" type="button" onClick={goNext}>
              {answer ? "Continue →" : "Skip →"}
            </button>
          ) : (
            <button className="text-button text-button-strong" type="button" onClick={goNext} disabled={!isAnswered(question, answer)}>
              Continue →
            </button>
          )}
        </div>
      </section>

      <footer className="assessment-bottom">
        <span>{answeredCount} answered</span>
        <span className="desktop-hint">Keys 1–7 answer · ← → navigate</span>
      </footer>
    </main>
  );
}

function LikertQuestion({ value, onSelect }: { value: number | null; onSelect: (value: number) => void }) {
  return (
    <div className="likert-wrap">
      <div className="likert-endpoints" aria-hidden="true">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
      <div className="likert-grid" role="radiogroup" aria-label="Agreement scale">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            key={n}
            type="button"
            className={`likert-button ${value === n ? "selected" : ""}`}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 7`}
            onClick={() => onSelect(n)}
          >
            <span>{n}</span>
          </button>
        ))}
      </div>
      <div className="likert-mobile-labels" aria-hidden="true">
        <span>Disagree</span><span>Neutral</span><span>Agree</span>
      </div>
    </div>
  );
}

function ChoiceQuestion({
  options,
  value,
  onSelect,
}: {
  options: { id: string; text: string }[];
  value: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="choice-list" role="radiogroup">
      {options.map((option, index) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === option.id}
          className={`choice-card ${value === option.id ? "selected" : ""}`}
          key={option.id}
          onClick={() => onSelect(option.id)}
        >
          <span className="choice-key">{index + 1}</span>
          <span>{option.text}</span>
        </button>
      ))}
    </div>
  );
}

function BurdenScale({ value, onSelect }: { value: number | null; onSelect: (value: number) => void }) {
  return (
    <div className="burden-wrap">
      <div className="burden-labels"><span>Not burdensome</span><span>Extremely burdensome</span></div>
      <div className="burden-grid" role="radiogroup" aria-label="Financial obligation burden from 0 to 10">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === n}
            className={`burden-button ${value === n ? "selected" : ""}`}
            key={n}
            onClick={() => onSelect(n)}
          >{n}</button>
        ))}
      </div>
    </div>
  );
}

function ReflectionQuestion({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <textarea
        className="reflection-input"
        value={value}
        maxLength={1000}
        rows={7}
        placeholder="Write whatever comes to mind…"
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="character-count">{value.length}/1000</div>
    </div>
  );
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
