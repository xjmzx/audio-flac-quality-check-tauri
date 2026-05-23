import { Radio } from "lucide-react";
import { Section } from "./Section";

// Stub: structural placeholder that mirrors the NostrPanel slot in smpl-tool
// and ndisc. No publish action wired — the quality scanner doesn't have an
// obvious thing to publish yet. When a use case appears (e.g. publish a
// library-quality report or share suspect-track lists), copy smpl-tool's
// `lib/nostr.ts` and the upload + publish flow from its NostrPanel.

export function NostrPanel() {
  return (
    <Section title="Publish · Nostr" icon={<Radio size={16} />}>
      <p className="text-xs text-muted leading-relaxed">
        Suite-uniform Nostr slot.
      </p>
      <p className="text-xs text-muted leading-relaxed">
        Nothing is wired yet — no obvious publish action for a quality scanner.
        When a use case appears, drop in <code className="text-fg/80">lib/nostr.ts</code>
        from <code className="text-fg/80">smpl-tool</code> for identity + NIP-96
        upload + NIP-94 publish.
      </p>
      <button
        disabled
        className="px-3 py-2 rounded-md bg-surface text-muted text-xs
                   cursor-not-allowed opacity-50"
      >
        Publish (TODO)
      </button>
    </Section>
  );
}
