export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ session: string }>;
}) {
  const { session } = await params;
  return (
    <main style={{maxWidth: 720, margin: "80px auto", padding: 24, fontFamily: "system-ui"}}>
      <p>Assessment session: {session}</p>
      <h1>Survey UI placeholder</h1>
      <p>
        Next implementation milestone: one-question-at-a-time UI, autosave,
        keyboard controls, back navigation, and session resume.
      </p>
    </main>
  );
}
