import { randomUUID } from "expo-crypto";
import { API_URL } from "@/lib/api/config";
import { credentialStorage } from "./storage";
import { createAuthClient } from "./client";
export const auth = createAuthClient({
  url: API_URL,
  storage: credentialStorage,
  uuid: randomUUID,
});
