import { DatasetWrapper } from "@rdfjs/wrapper";
import { Agent } from "@/app/lib/class/Agent";
import { SOLID } from "@/app/lib/class/Vocabulary";

export class WebIdDataset extends DatasetWrapper {
  get mainSubject(): Agent | undefined {
    for (const s of this.subjectsOf(SOLID.oidcIssuer, Agent)) {
      return s;
    }
    return undefined;
  }
}
