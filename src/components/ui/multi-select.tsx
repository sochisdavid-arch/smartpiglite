
"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const selectedOptions = selected.map(value => options.find(o => o.value === value)).filter(Boolean) as Option[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn("w-full justify-between h-auto min-h-10", className)}
                onClick={() => setOpen(!open)}
            >
                <div className="flex flex-wrap gap-1">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((option) => (
                        <Badge
                            key={option.value}
                            variant="secondary"
                            className="mr-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUnselect(option.value);
                            }}
                        >
                            {option.label}
                            <X className="ml-1 h-3 w-3" />
                        </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                </div>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Buscar..." />
              <CommandList>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          if (isSelected) {
                            handleUnselect(option.value);
                          } else {
                            onChange([...selected, option.value]);
                          }
                          setOpen(true);
                        }}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                        )}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
  );
}
