import { AssessmentFlow } from "@/components/AssessmentFlow";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ session: string }>;
}) {
  const { session } = await params;
  return <AssessmentFlow session={session} />;
}
