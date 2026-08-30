"use client";

import { useEffect, useState } from "react";

async function track(event: string, distinctId: string, properties?: Record<string, string | number | boolean | null>) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, distinctId, properties }),
      keepalive: true,
    });
  } catch {
    // Analytics must never block the product experience.
  }
}

export function ResultsActions({ session }: { session: string }) {
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [shareState, setShareState] = useState<"idle" | "working" | "copied" | "error">("idle");
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    void track("results_viewed", session);
  }, [session]);

  async function emailResults(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmailState("sending");
    void track("email_clicked", session);

    const response = await fetch("/api/report/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session, email: email.trim() }),
    });

    setEmailState(response.ok ? "sent" : "error");
  }

  async function shareProfile() {
    setShareState("working");
    void track("share_clicked", session);

    const response = await fetch("/api/report/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });

    if (!response.ok) {
      setShareState("error");
      return;
    }

    const { url } = await response.json() as { url: string };

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Money Self-Awareness Profile",
          text: "I took the Money Self-Awareness assessment.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShareState("copied");
      void track("share_completed", session);
    } catch {
      // Cancelling a native share dialog is not a product error.
      setShareState("idle");
    }
  }

  async function submitFeedback() {
    if (!rating) return;
    setFeedbackState("saving");

    const response = await fetch("/api/report/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session,
        accuracyRating: rating,
        feedbackText: feedback.trim() || undefined,
      }),
    });

    setFeedbackState(response.ok ? "saved" : "error");
  }

  return (
    <section className="results-section distribution-section" aria-labelledby="keep-heading">
      <p className="results-kicker">Keep or share your profile</p>
      <h2 id="keep-heading">Come back to it—or share the part you choose.</h2>

      <div className="distribution-grid">
        <form className="distribution-card" onSubmit={emailResults}>
          <span>Email</span>
          <h3>Send yourself the report link</h3>
          <p>The email contains your profile name and a private link, not your financial details.</p>
          <div className="email-row">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              required
            />
            <button type="submit" className="primary-button" disabled={emailState === "sending"}>
              {emailState === "sending" ? "Sending…" : emailState === "sent" ? "Sent" : "Email my results"}
            </button>
          </div>
          {emailState === "error" && <p className="action-error">Email could not be sent. You can still bookmark this page.</p>}
        </form>

        <div className="distribution-card">
          <span>Share</span>
          <h3>Share a privacy-safe profile card</h3>
          <p>Your public card includes your archetype and top money motivations. It excludes financial context, reflection, and the private report link.</p>
          <button type="button" className="secondary-button" onClick={() => void shareProfile()} disabled={shareState === "working"}>
            {shareState === "working" ? "Creating…" : shareState === "copied" ? "Share link ready" : "Share my profile"}
          </button>
          {shareState === "error" && <p className="action-error">We could not create a share link.</p>}
        </div>
      </div>

      <div className="feedback-card">
        <p className="results-kicker">Help us make this better</p>
        <h3>How accurately did this describe your relationship with money?</h3>
        <div className="rating-row" role="radiogroup" aria-label="Accuracy rating from 1 to 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              role="radio"
              aria-checked={rating === value}
              className={rating === value ? "selected" : ""}
              key={value}
              onClick={() => {
                setRating(value);
                setFeedbackState("idle");
                void track("feedback_opened", session, { rating: value });
              }}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="rating-labels"><span>Not accurate</span><span>Very accurate</span></div>

        {rating !== null && (
          <div className="feedback-detail">
            <label htmlFor="profile-feedback">What felt wrong, incomplete, or surprisingly accurate? <span>Optional</span></label>
            <textarea
              id="profile-feedback"
              rows={4}
              maxLength={2000}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Anything you want us to know…"
            />
            <button type="button" className="secondary-button" onClick={() => void submitFeedback()} disabled={feedbackState === "saving"}>
              {feedbackState === "saving" ? "Saving…" : feedbackState === "saved" ? "Feedback saved" : "Submit feedback"}
            </button>
            {feedbackState === "error" && <p className="action-error">We could not save your feedback.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
