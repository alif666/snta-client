"use server";

import type {
  ApiResponse,
  InterestMetric,
  Note,
  Pagination,
  Post,
  Session,
  User,
} from "@/lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

interface Paginated<T> {
  [key: string]: T[] | Pagination;
  pagination: Pagination;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const body = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      return {
        success: false,
        message: body.message ?? "Something went wrong",
      };
    }

    return body;
  } catch {
    return {
      success: false,
      message: "Unable to reach the API. Is the backend running?",
    };
  }
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ accessToken: string; user: User }>> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  interests: string[];
}): Promise<ApiResponse<{ user: User }>> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listPublicPostsAction(page = 1, limit = 20) {
  return apiRequest<{ posts: Post[]; pagination: Pagination }>(
    `/posts?page=${page}&limit=${limit}`,
  );
}

export async function listUserPostsAction(
  userId: string,
  page = 1,
  limit = 20,
) {
  return apiRequest<{ posts: Post[]; pagination: Pagination }>(
    `/users/${userId}/posts?page=${page}&limit=${limit}`,
  );
}

export async function createPostAction(
  token: string,
  input: { title: string; content: string },
) {
  return apiRequest<{ post: Post }>(
    "/posts",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function updatePostAction(
  token: string,
  id: string,
  input: { title?: string; content?: string },
) {
  return apiRequest<{ post: Post }>(
    `/posts/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function deletePostAction(token: string, id: string) {
  return apiRequest<undefined>(`/posts/${id}`, { method: "DELETE" }, token);
}

export async function listNotesAction(token: string, page = 1, limit = 20) {
  return apiRequest<{ notes: Note[]; pagination: Pagination }>(
    `/notes?page=${page}&limit=${limit}`,
    {},
    token,
  );
}

export async function createNoteAction(
  token: string,
  input: { title: string; content: string },
) {
  return apiRequest<{ note: Note }>(
    "/notes",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function updateNoteAction(
  token: string,
  id: string,
  input: { title?: string; content?: string },
) {
  return apiRequest<{ note: Note }>(
    `/notes/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function deleteNoteAction(token: string, id: string) {
  return apiRequest<undefined>(`/notes/${id}`, { method: "DELETE" }, token);
}

export async function listUsersAction(token: string, page = 1, limit = 20) {
  return apiRequest<{ users: User[]; pagination: Pagination }>(
    `/users?page=${page}&limit=${limit}`,
    {},
    token,
  );
}

export async function createUserAction(
  token: string,
  input: {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    interests: string[];
  },
) {
  return apiRequest<{ user: User }>(
    "/users",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
}

export async function updateUserAction(
  token: string,
  id: string,
  input: { name?: string; role?: "user" | "admin"; interests?: string[] },
) {
  return apiRequest<{ user: User }>(
    `/users/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
}

export async function deleteUserAction(token: string, id: string) {
  return apiRequest<undefined>(`/users/${id}`, { method: "DELETE" }, token);
}

export async function listInterestMetricsAction(token: string) {
  return apiRequest<{ interests: InterestMetric[] }>(
    "/users/analytics/interests",
    {},
    token,
  );
}

export type {
  ApiResponse,
  InterestMetric,
  Note,
  Pagination,
  Post,
  Session,
  User,
};
