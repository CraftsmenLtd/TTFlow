import { ButtonLink } from '../components/ui/Button';

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-ink-secondary">{body}</p>
      <ButtonLink to="/">Back to home</ButtonLink>
    </div>
  );
}

export function NotFoundPage() {
  return <Message title="Page not found" body="The page you are looking for does not exist." />;
}

// Route error boundary. Error details are never shown to users.
export function ErrorPage() {
  return (
    <Message
      title="Something went wrong"
      body="Please try again. If it keeps happening, tell the organisers."
    />
  );
}
