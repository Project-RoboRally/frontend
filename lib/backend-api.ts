const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const login = async (username: string, password: string) => {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username, password}),
  });

  if (!response.ok) {
    throw new Error("Failed to login");
  }

  return response.json();
}