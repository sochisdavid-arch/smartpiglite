
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    options: { value: string; label: string }[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    noResultsText?: string;
    name?: string;
}

export function Combobox({ options, value, onChange, placeholder, noResultsText, name }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || '');

  React.useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === internalValue ? "" : currentValue;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    setOpen(false);
  };

  return (
    <>
      <input type="hidden" name={name} value={internalValue} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {internalValue
              ? options.find((option) => option.value === internalValue)?.label
              : placeholder || "Seleccione una opción..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={placeholder || "Buscar..."} />
            <CommandList>
              <CommandEmpty>{noResultsText || "No se encontraron resultados."}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        internalValue === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
