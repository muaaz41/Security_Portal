
// Simulated API response delay (ms)
const DELAY = 800;

/**
 * Simulate API request with artificial delay
 */
export async function simulateRequest<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, DELAY);
  });
}

/**
 * Simulate API error with artificial delay
 */
export async function simulateError(message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, DELAY);
  });
}

/**
 * Common fetch wrapper with error handling
 */
export async function fetchWithAuth<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  // In a real app, we would add auth token here
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
