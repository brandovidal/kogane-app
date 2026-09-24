import { Users } from "lucide-react";

import { usePeople } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import { PERSON_ALL, PERSON_ME, usePersonFilter } from "@/shared/stores/person.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

// Header filter of the expense lists (D71, D78): Yo · Todos · each person
function PersonFilterView() {
  const person = usePersonFilter((state) => state.person);
  const setPerson = usePersonFilter((state) => state.setPerson);
  const others = usePeople().data?.filter((item) => item.isActive && !item.isDefault) ?? [];

  return (
    <Select value={person} onValueChange={setPerson}>
      <SelectTrigger className="h-8 w-[130px] text-xs" aria-label="Persona">
        <Users className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={PERSON_ME}>Yo</SelectItem>
        <SelectItem value={PERSON_ALL}>Todos</SelectItem>
        {others.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const PersonFilter = withQuery(PersonFilterView);
