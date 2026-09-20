import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useExitConfirmation() {
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [allowExit, setAllowExit] = useState(false);

  // We only block if they are trying to go back to the root '/' or '/login'
  const blocker = useBlocker(
    ({ nextLocation }) =>
      !allowExit && (nextLocation.pathname === '/' || nextLocation.pathname === '/login')
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (showExitPrompt) {
        // This means they pressed back a second time while the prompt was active
        setAllowExit(true);
        setTimeout(() => {
          blocker.proceed?.();
        }, 0);
      } else {
        // First press, show the prompt and start the timer
        setShowExitPrompt(true);
        
        const timer = setTimeout(() => {
          setShowExitPrompt(false);
          blocker.reset?.();
        }, 3000); // 3 seconds to press again
        
        return () => clearTimeout(timer);
      }
    }
  }, [blocker.state, showExitPrompt, blocker]);

  return showExitPrompt;
}
