/**
 * todoService.ts — Week 9 (Sprint 07: Async & Multi-Threading)
 *
 * Service untuk operasi CRUD async ke JSONPlaceholder REST API.
 * Demonstrasi:
 *  - async/await + try/catch
 *  - GET, POST, PATCH request
 *  - Loading state management
 *  - AbortController untuk cleanup
 */

export const TODO_API = 'https://jsonplaceholder.typicode.com';

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
};

/**
 * Mengambil 10 daftar todo dari API (GET /todos?_limit=10)
 * Demonstrasi: async/await + fetch + AbortController
 */
export async function fetchTodos(signal?: AbortSignal): Promise<Todo[]> {
  const res = await fetch(`${TODO_API}/todos?_limit=10`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data: ${res.status} ${res.statusText}`);
  }

  const data: Todo[] = await res.json();
  return data;
}

/**
 * Menambahkan todo baru ke API (POST /todos)
 * Demonstrasi: async/await + POST request + JSON.stringify
 * Catatan: JSONPlaceholder tidak menyimpan data secara permanen (simulasi)
 */
export async function addTodo(title: string): Promise<Todo> {
  const res = await fetch(`${TODO_API}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      title,
      completed: false,
      userId: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Gagal menambahkan todo: ${res.status}`);
  }

  const data: Todo = await res.json();
  return data;
}

/**
 * Mengubah status selesai todo (PATCH /todos/:id)
 * Demonstrasi: async/await + PATCH request + toggle state
 * Catatan: JSONPlaceholder mengembalikan 200 OK tetapi tidak menyimpan perubahan
 */
export async function toggleTodoStatus(
  id: number,
  completed: boolean
): Promise<Todo> {
  const res = await fetch(`${TODO_API}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ completed }),
  });

  if (!res.ok) {
    throw new Error(`Gagal mengubah status: ${res.status}`);
  }

  const data: Todo = await res.json();
  return data;
}
