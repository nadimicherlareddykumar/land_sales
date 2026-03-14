import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CompareContext = createContext(null);
const MAX = 3;

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = useCallback((property) => {
    setItems((prev) => {
      if (prev.length >= MAX || prev.find((x) => x._id === property._id)) return prev;
      return [...prev, property];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x._id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isComparing = useCallback((id) => items.some((x) => x._id === id), [items]);

  const toggle = useCallback((property) => {
    setItems((prev) => {
      const exists = prev.find((x) => x._id === property._id);
      if (exists) return prev.filter((x) => x._id !== property._id);
      if (prev.length >= MAX) return prev;
      return [...prev, property];
    });
  }, []);

  const value = useMemo(
    () => ({ items, add, remove, clear, toggle, isComparing, count: items.length }),
    [items, add, remove, clear, toggle, isComparing]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be inside CompareProvider");
  return ctx;
};
