import { apiRequest } from "./client";

export const loginApi = async (email, password) => {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};