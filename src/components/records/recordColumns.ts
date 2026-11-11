import type { CSSProperties } from "react";

export type RecordColumns = {
  person?: boolean;
  waiting?: boolean;
  documents?: boolean;
};

export const COLUMNS_CLASS = "md:grid-cols-(--record-columns)";

export function cardColumns({ person = true, documents = false }: RecordColumns): string {
  return ["4px", person && "minmax(0,16rem)", "minmax(0,1fr)", "10rem", "8rem", "8rem", documents && "6rem", "auto"]
    .filter(Boolean)
    .join(" ");
}

export function tableColumns({ person = true, waiting = false, documents = false }: RecordColumns): string {
  return [person && "220px", "minmax(0,1fr)", "220px", waiting && "8rem", "140px", documents && "120px"]
    .filter(Boolean)
    .join(" ");
}

export function columnsStyle(template: string): CSSProperties {
  return { "--record-columns": template } as CSSProperties;
}
