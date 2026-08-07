import { getAllUsernames } from "../../../../lib/accounts";
import ProfileView from "./ProfileView";

/* ─────────────── Static Params (for static export) ─────────────── */
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
