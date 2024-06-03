import { Dispatch, SetStateAction } from "react";

interface EffectsButtonProps {
  setIsFireDetected: Dispatch<SetStateAction<boolean>>;
}

export function EffectsButton({ setIsFireDetected }: EffectsButtonProps) {
  return (
    <div>
      <button onClick={() => setIsFireDetected(false)}>Turn off alert</button>
    </div>
  );
}
