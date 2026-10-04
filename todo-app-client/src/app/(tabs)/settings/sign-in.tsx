import { useRouter } from "expo-router";
import { AuthForm } from "@/features/auth/components/auth-form";
export default function AuthScreen() {
  const router = useRouter();
  return <AuthForm signUp={false} onComplete={() => router.dismissTo("/settings")} onSwitch={() => router.replace("/settings/sign-up")} />;
}
