import { useQuery } from "@tanstack/react-query";
import { auth } from "./session";

export function AuthBootstrap() {
  useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => auth.getSession(),
    staleTime: Infinity,
    retry: 1,
  });
  return null;
}
