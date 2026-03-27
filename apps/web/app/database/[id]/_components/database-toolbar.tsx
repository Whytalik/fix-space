"use client";

import { Button } from "@/components/ui/primitives/button";
import { useDatabaseContext } from "@/context/database-context";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FilterPanel } from "./filter-panel";
import { SortPanel } from "./sort-panel";

export function DatabaseToolbar() {
  const { search, setSearch, sorts, filters } = useDatabaseContext();

  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [inputValue, setInputValue] = useState(search);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown, { capture: true });
    return () => document.removeEventListener("mousedown", handleMouseDown, { capture: true });
  }, []);

  // Sync external search resets (e.g. database navigation)
  useEffect(() => {
    if (search === "") {
      setInputValue("");
      setSearchOpen(false);
    }
  }, [search]);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  function handleSearchChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  }

  function clearSearch() {
    setInputValue("");
    setSearch("");
    setSearchOpen(false);
  }

  function toggleSort() {
    setSortOpen((v) => !v);
    setFilterOpen(false);
  }

  function toggleFilter() {
    setFilterOpen((v) => !v);
    setSortOpen(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Search */}
      <div className="relative flex items-center">
        {searchOpen ? (
          <div className="flex items-center gap-1 border border-stroke rounded-lg px-2 py-1 bg-bg">
            <Search size={13} className="text-ink-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search records…"
              className="text-xs text-ink bg-transparent outline-none w-40 placeholder:text-ink-muted"
            />
            <button type="button" onClick={clearSearch} className="text-ink-muted hover:text-ink transition-colors">
              <X size={13} />
            </button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
            <Search size={13} />
            Search
          </Button>
        )}
      </div>

      {/* Sort */}
      <div className="relative" ref={sortRef}>
        <Button variant="ghost" size="sm" onClick={toggleSort} active={sortOpen || sorts.length > 0}>
          <ArrowUpDown size={13} />
          Sort
          {sorts.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold leading-none">
              {sorts.length}
            </span>
          )}
        </Button>
        {sortOpen && <SortPanel onClose={() => setSortOpen(false)} />}
      </div>

      {/* Filter */}
      <div className="relative" ref={filterRef}>
        <Button variant="ghost" size="sm" onClick={toggleFilter} active={filterOpen || filters.length > 0}>
          <SlidersHorizontal size={13} />
          Filter
          {filters.length > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold leading-none">
              {filters.length}
            </span>
          )}
        </Button>
        {filterOpen && <FilterPanel onClose={() => setFilterOpen(false)} />}
      </div>
    </div>
  );
}
