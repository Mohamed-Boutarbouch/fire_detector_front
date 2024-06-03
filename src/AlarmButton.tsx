import { AlarmOn, MuteAlarm } from "./icons";

interface AlarmButtonProps {
  isSoundEnabled: boolean;
  enableSound: () => void;
}

export function AlarmButton({ isSoundEnabled, enableSound }: AlarmButtonProps) {
  console.log(isSoundEnabled);

  return (
    <div>
      <button
        onClick={enableSound}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          cursor: isSoundEnabled ? "not-allowed" : "pointer",
          marginBottom: "10px",
        }}
        disabled={isSoundEnabled}
      >
        {isSoundEnabled ? <AlarmOn /> : <MuteAlarm />}
      </button>
    </div>
  );
}
