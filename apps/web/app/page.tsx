export default async function Home() {
  const API_BASE_URL = 'http://localhost:3000';

  const res = await fetch(`${API_BASE_URL}/user`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }

  const user = await res.json();

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>User ID: {user.userId}</p>
    </div>
  );
}
