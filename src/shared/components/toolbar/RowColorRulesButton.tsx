import { Palette } from 'lucide-react'

import { Button } from '@/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/ui/dropdown-menu'
import { RowColorRulesMenu, type RowColorRulesMenuProps } from './RowColorRulesMenu'

/** Stand-alone entry to "Colorear la fila cuando…" for lists without a view-settings menu. */
export function RowColorRulesButton(props: RowColorRulesMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Color condicional de filas">
          <Palette aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <RowColorRulesMenu {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
