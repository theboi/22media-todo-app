import { Platform } from "react-native";
import Constants from "expo-constants";
import { resolveApiUrl } from "./resolve-url";

export const API_URL = resolveApiUrl({
  override: process.env.EXPO_PUBLIC_API_URL,
  platform: Platform.OS,
  hostUri: Constants.expoConfig?.hostUri,
  development: __DEV__,
});
