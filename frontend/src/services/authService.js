import { DEMO_AUTH_ENABLED } from "../config/env";
import { api, getAccessToken, setAccessToken } from "./api";

const demoUsers = [
  {
    email: "student@demo.local",
    password: "demo123",
    user: {
      id: "demo-student",
      role: "STUDENT",
      mustChangePassword: false,
    },
  },
  {
    email: "tpo@demo.local",
    password: "demo123",
    user: {
      id: "demo-tpo",
      role: "TPO",
      mustChangePassword: false,
    },
  },
];

function getDemoUser(credentials) {
  return demoUsers.find(
    (demoUser) =>
      demoUser.email === credentials.email &&
      demoUser.password === credentials.password,
  );
}

function getDemoUserFromToken() {
  const token = getAccessToken();
  return demoUsers.find((demoUser) => token === `demo:${demoUser.user.role}`)
    ?.user;
}

export const authService = {
  async login(credentials) {
    if (DEMO_AUTH_ENABLED) {
      const demoUser = getDemoUser(credentials);

      if (!demoUser) {
        const error = new Error(
          "Use one of the temporary demo accounts shown below.",
        );
        error.code = "INVALID_DEMO_CREDENTIALS";
        throw error;
      }

      setAccessToken(`demo:${demoUser.user.role}`);
      return { user: demoUser.user, accessToken: `demo:${demoUser.user.role}` };
    }

    const data = await api.post("/auth/login", credentials);
    setAccessToken(data.accessToken);
    return data;
  },

  me() {
    if (DEMO_AUTH_ENABLED) {
      const user = getDemoUserFromToken();
      return user
        ? Promise.resolve(user)
        : Promise.reject(new Error("Demo session not found."));
    }

    return api.get("/auth/me");
  },

  async logout() {
    if (DEMO_AUTH_ENABLED && getDemoUserFromToken()) {
      setAccessToken(null);
      return;
    }

    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
    }
  },
};
