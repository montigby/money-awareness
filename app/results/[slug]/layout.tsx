import "./stage6.module.css";
import { ResultsActions } from "@/components/ResultsActions";

export default async function ResultsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      {children}
      <div className="results-shell results-actions-shell">
        <ResultsActions session={slug} />
      </div>
    </>
  );
}
