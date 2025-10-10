import { useState } from 'react';
import { trpc } from '@agent-ts/web';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function TrpcUsersPreview() {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: '',
    email: ''
  });

  const usersQuery = trpc.getUsers.useQuery();
  const addUserMutation = trpc.addUser.useMutation({
    onSuccess: async () => {
      await utils.getUsers.invalidate();
      setForm({ name: '', email: '' });
    }
  });

  const canSubmit = form.name.length > 0 && form.email.length > 0;

  return (
    <section className="rounded-lg border bg-background p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">tRPC + Drizzle preview</h2>
        <p className="text-sm text-muted-foreground">
          Persist demo users with a type-safe API backed by Drizzle ORM. Entries are validated end-to-end.
        </p>
      </div>

      <form
        className="mt-4 flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) {
            return;
          }
          addUserMutation.mutate(form);
        }}
      >
        <Input
          name="name"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <Input
          name="email"
          type="email"
          placeholder="ada@example.com"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <Button type="submit" disabled={!canSubmit || addUserMutation.isPending}>
          {addUserMutation.isPending ? 'Adding…' : 'Add user'}
        </Button>
      </form>

      <div className="mt-6">
        {usersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        ) : usersQuery.error ? (
          <p className="text-sm text-destructive">Failed to load users. Please ensure the API is running.</p>
        ) : usersQuery.data && usersQuery.data.length > 0 ? (
          <ul className="space-y-2">
            {usersQuery.data.map((user) => (
              <li key={user.id} className="rounded-md border bg-muted/40 p-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No users have been created yet.</p>
        )}
      </div>
    </section>
  );
}
