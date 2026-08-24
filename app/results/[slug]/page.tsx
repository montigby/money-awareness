export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main style={{maxWidth: 760, margin: "80px auto", padding: 24, fontFamily: "system-ui"}}>
      <p>Report: {slug}</p>
      <h1>Your Money Profile</h1>
      <p>Deterministic results UI placeholder.</p>
    </main>
  );
}
