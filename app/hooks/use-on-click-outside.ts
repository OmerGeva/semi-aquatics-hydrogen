import { useState, useEffect, SetStateAction, Dispatch } from "react";

// Hook
export const useOnClickOutside = (ref: any, handler: Dispatch<SetStateAction<boolean>>) => {
  useEffect(
    () => {
      const listener = (event: Event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(false);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    
    [ref, handler]
  );
}