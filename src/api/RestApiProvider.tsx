import { createContext, useContext, type ReactNode } from "react";
import type { RestApiConfig } from "./http";

const RestApiContext = createContext<RestApiConfig>({});

export type RestApiProviderProps = {
  config: RestApiConfig;
  children: ReactNode;
};

export const RestApiProvider = ({ config, children }: RestApiProviderProps) => (
  <RestApiContext.Provider value={config}>{children}</RestApiContext.Provider>
);

export function useRestApiConfig(): RestApiConfig {
  return useContext(RestApiContext);
}
