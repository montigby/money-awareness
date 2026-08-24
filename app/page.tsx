export default function HomePage() {
  return (
    <main style={{maxWidth: 760, margin: "80px auto", padding: 24, fontFamily: "system-ui"}}>
      <p style={{letterSpacing: 1, textTransform: "uppercase", fontSize: 13}}>
        Money Self-Awareness
      </p>
      <h1 style={{fontSize: 56, lineHeight: 1.05}}>
        Understand your relationship with money.
      </h1>
      <p style={{fontSize: 20, lineHeight: 1.6}}>
        A reflective assessment of security, enoughness, identity, control,
        freedom, and presence.
      </p>
      <form action="/api/assessment/start" method="post">
        <button type="submit" style={{fontSize: 18, padding: "14px 20px"}}>
          Take the assessment
        </button>
      </form>
      <p>About 10 minutes · No account required</p>
    </main>
  );
}
