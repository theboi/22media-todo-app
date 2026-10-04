import { useRouter } from "expo-router";
import { VerifyEmailForm } from "@/features/lists/components/verify-email-form";
export default function VerifyEmailScreen() {
  const router = useRouter();
  return <VerifyEmailForm onVerified={() => router.dismiss()} />;
}
