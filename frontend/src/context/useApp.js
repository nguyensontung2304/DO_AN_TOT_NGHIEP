import { useContext } from "react";
import { AppContext } from "./AppContext.jsx";

export function useApp() {
  return useContext(AppContext);
}
