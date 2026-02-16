"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { fetchCategoricalStats } from "@/lib/api";
import { CategoricalValueDistributionChart } from "@/components/categorical-value-distribution-chart";

export function CategoricalView() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { ref, inView } = useInView();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["categorical-stats", debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        fetchCategoricalStats({ pageParam, search: debouncedSearch }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.has_more ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  const totalItems = data?.pages[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Distribución de Variables Categóricas
          </h2>
          <p className="text-sm text-muted-foreground">
            Explora la frecuencia de valores para cada variable ({totalItems}{" "}
            encontradas)
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar variable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Grid of Charts */}
      {status === "pending" ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : status === "error" ? (
        <div className="rounded-xl border border-red-900/20 bg-red-900/10 p-6 text-center text-red-500">
          Error al cargar los datos. Por favor intenta nuevamente.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data?.pages.flatMap((page) =>
            page.items.map((item) => (
              <CategoricalValueDistributionChart
                key={item.variable}
                data={item}
              />
            )),
          )}

          {data?.pages[0].items.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No se encontraron variables con los criterios de búsqueda.
            </div>
          )}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}
