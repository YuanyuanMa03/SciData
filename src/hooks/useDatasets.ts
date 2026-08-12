import { useEffect, useState } from "react";
import { loadDatasets } from "../data/datasets";
import type { ScientificDataset } from "../types/dataset";

export interface UseDatasetsResult {
  datasets: readonly ScientificDataset[];
  loading: boolean;
  error: Error | null;
}

const EMPTY_DATASETS: readonly ScientificDataset[] = [];

export function useDatasets(): UseDatasetsResult {
  const [datasets, setDatasets] = useState<readonly ScientificDataset[]>(EMPTY_DATASETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    void loadDatasets().then(
      (loadedDatasets) => {
        if (!active) return;
        setDatasets(loadedDatasets);
        setError(null);
        setLoading(false);
      },
      (reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason : new Error("Unable to load datasets"));
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, []);

  return { datasets, loading, error };
}
