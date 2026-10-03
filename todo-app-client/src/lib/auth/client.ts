export type AuthSession = { accountId: string; email: string | null };
type Storage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
};
type Deps = {
  url: string;
  storage: Storage;
  uuid(): string;
  transport?: typeof fetch;
};
const record = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The server returned an invalid session.");
  return Object.fromEntries(Object.entries(value));
};
const parseSession = (value: unknown): AuthSession => {
  const data = record(value);
  const account = record(data.account);
  if (typeof account.id !== "string" || !account.id)
    throw new Error("The server returned an invalid session.");
  if (data.user === null) return { accountId: account.id, email: null };
  const user = record(data.user);
  if (typeof user.email !== "string" || !user.email)
    throw new Error("The server returned an invalid session.");
  return { accountId: account.id, email: user.email };
};
class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const createAuthClient = ({
  url,
  storage,
  uuid,
  transport = (input, init) => globalThis.fetch(input, init),
}: Deps) => {
  let provisioning: Promise<string> | null = null;
  let installation: Promise<string> | null = null;
  const send = async (
    path: string,
    token: string | null,
    body?: object,
  ): Promise<unknown> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      let response: Response;
      try {
        response = await transport(`${url}${path}`, {
          method: body ? "POST" : "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
      } catch {
        throw new Error(
          "Cannot reach Eves. Check your connection and try again.",
        );
      }
      const payload: unknown = await response.json();
      const data = record(payload);
      if (!response.ok) {
        const error = record(data.error);
        const code =
          typeof error.code === "string" ? error.code : "REQUEST_FAILED";
        const messages: Record<string, string> = {
          INVALID_CREDENTIALS: "The email or password is incorrect.",
          UNAUTHENTICATED: "Your session is no longer valid.",
          ALREADY_REGISTERED: "You are already signed in.",
          RATE_LIMITED: "Too many attempts. Please try again later.",
        };
        const fields =
          typeof error.fields === "object" && error.fields !== null
            ? Object.values(error.fields).flatMap((value) =>
                Array.isArray(value)
                  ? value.filter(
                      (message): message is string =>
                        typeof message === "string",
                    )
                  : [],
              )
            : [];
        throw new AuthError(
          code,
          messages[code] ??
            (fields.join(" ") || "Could not sign in. Please try again."),
        );
      }
      return data.data;
    } finally {
      clearTimeout(timer);
    }
  };
  const deviceId = (): Promise<string> => {
    if (!installation)
      installation = (async () => {
        let id = await storage.get("eves.device");
        if (!id) {
          id = uuid();
          await storage.set("eves.device", id);
        }
        return id;
      })().catch((error: unknown) => {
        installation = null;
        throw error;
      });
    return installation;
  };
  const install = async (value: unknown) => {
    const data = record(value);
    const session = parseSession(data.session);
    if (
      data.token_type !== "Bearer" ||
      typeof data.token !== "string" ||
      !data.token
    )
      throw new Error("The server returned an invalid session.");
    await storage.set("eves.token", data.token);
    return { token: data.token, session };
  };
  const getToken = async (): Promise<string> => {
    const token = await storage.get("eves.token");
    if (token) return token;
    if (!provisioning)
      provisioning = (async () =>
        (
          await install(
            await send("/auth/guest", null, { device_id: await deviceId() }),
          )
        ).token)().finally(() => {
        provisioning = null;
      });
    return provisioning;
  };
  return {
    getToken,
    getSession: async (): Promise<AuthSession> =>
      parseSession(await send("/auth/me", await getToken())),
    signIn: async (email: string, password: string): Promise<AuthSession> => {
      const body = {
        email: email.trim().toLowerCase(),
        password,
        device_id: await deviceId(),
      };
      const token = await getToken();
      let value: unknown;
      try {
        value = await send("/auth/login", token, body);
      } catch (error) {
        if (!(error instanceof AuthError && error.code === "UNAUTHENTICATED"))
          throw error;
        value = await send("/auth/login", null, body);
      }
      return (await install(value)).session;
    },
  };
};
