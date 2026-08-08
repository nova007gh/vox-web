import { getAllUsernames } from "../../../../lib/accounts";
import ProfileView from "./ProfileView";

/* ─────────────── Allow on-demand rendering for any username ─────────────── */
export const dynamicParams = true;

/* ─────────────── Static Params ─────────────── */
export function generateStaticParams() {
  return getAllUsernames().map((username) => ({ username }));
}

/* ─────────────── Page Props ─────────────── */
interface ProfilePageProps {
  params: { username: string };
}

/* ─────────────── Page ─────────────── */
export default function DynamicProfilePage({ params }: ProfilePageProps) {
  return <ProfileView username={params.username} />;
}
