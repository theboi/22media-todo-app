export const resolveApiUrl = ({
  override,
  platform,
  hostUri,
  development,
}: {
  override?: string;
  platform: string;
  hostUri?: string | null;
  development: boolean;
}): string => {
  if (!override && development && platform !== "web" && hostUri) {
    const host = new URL(`http://${hostUri}`).hostname;
    return `http://${host}:8000/api`;
  }
  return (
    override ??
    (platform === "android"
      ? "http://10.0.2.2:8000/api"
      : "http://localhost:8000/api")
  ).replace(/\/$/, "");
};
