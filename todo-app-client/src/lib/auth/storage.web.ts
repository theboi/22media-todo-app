// Development web preview only. Native credentials use SecureStore.
export const credentialStorage = {
  get: async (key: string): Promise<string | null> => localStorage.getItem(key),
  set: async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
  },
};
