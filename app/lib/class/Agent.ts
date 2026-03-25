import {
  TermWrapper,
  LiteralAs,
  NamedNodeAs,
  NamedNodeFrom,
  TermAs,
} from "@rdfjs/wrapper";
import { PIM, SOLID, VCARD } from "@/app/lib/class/Vocabulary";

/**
 * Wraps a vCard node that carries vcard:value (e.g. email).
 * We use VCARD.value (...#value), not hasValue (...#hasValue), to match the W3C vCard ontology.
 */
class HasValue extends TermWrapper {
  get vcardValue(): string {
    const literal = this.singularNullable(VCARD.value, LiteralAs.string);
    if (literal != null) return literal;
    const iri = this.singularNullable(VCARD.value, NamedNodeAs.string);
    if (iri != null) return iri;
    return this.value;
  }
}

/**
 * Minimal Agent wrapper for the NVS portal.
 *
 * Only exposes the fields NVS actually needs from a WebID profile:
 *   - name  (vcard:fn, fallback to WebID fragment)
 *   - email (vcard:hasEmail → vcard:value)
 *   - photo (vcard:hasPhoto)
 *   - storage URLs (pim:storage / solid:storage) → used to locate the volunteer container
 */
export class Agent extends TermWrapper {
  /** Display name — vcard:fn, falling back to the WebID path fragment. */
  get name(): string | null {
    return (
      this.singularNullable(VCARD.fn, LiteralAs.string) ??
      this.value.split("/").pop()?.split("#")[0] ??
      null
    );
  }

  /** Profile photo URL (handles both named node and literal representations). */
  get photoUrl(): string | null {
    return (
      this.singularNullable(VCARD.hasPhoto, NamedNodeAs.string) ??
      this.singularNullable(VCARD.hasPhoto, LiteralAs.string) ??
      null
    );
  }

  /** Email address (resolves vcard:hasEmail → vcard:value, strips mailto:). */
  get email(): string | null {
    const raw = this.singularNullable(VCARD.hasEmail, TermAs.instance(HasValue))?.vcardValue ?? null;
    if (raw == null) return null;
    return raw.startsWith("mailto:") ? raw.slice(7) : raw;
  }

  /** All declared storage roots (pim:storage + solid:storage). */
  get storageUrls(): Set<string> {
    return new Set([
      ...this.objects(PIM.storage, NamedNodeAs.string, NamedNodeFrom.string),
      ...this.objects(SOLID.storage, NamedNodeAs.string, NamedNodeFrom.string),
    ]);
  }
}
