import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useLeaveGuard(active: boolean) {
  const navigate = useNavigate();

  // Block browser refresh / tab close
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);

  // Block browser back/forward via popstate
  useEffect(() => {
    if (!active) return;

    // Push a duplicate entry onto the history stack so back has somewhere to go
    window.history.pushState(null, "", window.location.href);

    const handler = (e: PopStateEvent) => {
      // Push state again to re-block after they try to go back
      window.history.pushState(null, "", window.location.href);

      const ok = window.confirm(
        "You have unsaved progress. Are you sure you want to leave? Your answers will be lost."
      );
      if (ok) {
        // Remove our handler before actually navigating back
        window.removeEventListener("popstate", handler);
        navigate(-1);
      }
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [active, navigate]);
}