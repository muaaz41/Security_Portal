import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface VisitTimerProps {
  startTime: Date;
  isActive?: boolean; // Control if timer is running
  onTimerStop?: (finalDuration: string) => void; // Callback to return final duration
}

const VisitTimer: React.FC<VisitTimerProps> = ({ 
  startTime, 
  isActive = true, // Default to active
  onTimerStop
}) => {
  const [duration, setDuration] = useState<string>("00:00:00");
  const [finalDuration, setFinalDuration] = useState<string | null>(null);

  useEffect(() => {
    const calculateDuration = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      
      const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      
      setDuration(formattedDuration);
      return formattedDuration;
    };

    // Initial calculation
    const initialDuration = calculateDuration();
    
    // When timer becomes inactive, capture the final duration
    if (!isActive && !finalDuration) {
      const lastDuration = initialDuration;
      setFinalDuration(lastDuration);
      if (onTimerStop) onTimerStop(lastDuration);
    }
    
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(calculateDuration, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, isActive, finalDuration, onTimerStop]);

  const displayDuration = !isActive && finalDuration ? finalDuration : duration;

  return (
    <div className="flex items-center bg-primary/5 p-2 rounded-md">
      <Timer className="w-4 h-4 mr-2 text-primary" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          {!isActive ? "Final Duration" : "Duration"}
        </span>
        <span className="font-mono font-medium">{displayDuration}</span>
      </div>
    </div>
  );
};

export default VisitTimer;