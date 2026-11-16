import { redirect } from "next/navigation";

export default async function ChatPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  if (params?.q) {
    redirect(`/tomato-ai?q=${encodeURIComponent(params.q)}`);
  }
  redirect("/tomato-ai");
}
