import { ButtonLink } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Public page: it must not show employee names, photos or teams (ISO decision D3).
const EVENTS = [
  { name: "Men's Singles", detail: 'Group round robin, then knockouts' },
  { name: "Men's Doubles", detail: 'Random partner lottery, then groups and knockouts' },
  { name: "Women's Singles", detail: 'Round robin, then the final' },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-brand px-5 py-8 text-on-brand sm:px-8 sm:py-12">
        <p className="text-sm font-semibold tracking-wide text-on-brand/80 uppercase">
          Craftsmen Annual Program
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Table Tennis Tournament 2026</h1>
        <p className="mt-3 max-w-xl text-on-brand/90">
          Registration opens soon. Sign up with your company email to take part.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/register" variant="accent" size="lg">
            Register
          </ButtonLink>
          <ButtonLink to="/rules" variant="secondary" size="lg">
            Read the rules
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="events-heading" className="space-y-4">
        <h2 id="events-heading" className="text-xl font-semibold">
          Events
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {EVENTS.map((event) => (
            <li key={event.name}>
              <Card className="h-full">
                <h3 className="font-semibold">{event.name}</h3>
                <p className="mt-1 text-sm text-ink-secondary">{event.detail}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
