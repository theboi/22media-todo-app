import { useRouter } from "expo-router";
import { AuthForm } from "@/features/auth/components/auth-form";
export default function AuthScreen() {
  const router = useRouter();
  return <AuthForm signUp={false} onComplete={() => router.dismiss()} onSwitch={() => router.replace("/sign-up")} />;
}
