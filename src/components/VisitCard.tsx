import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, UserCheck, UserX, User, FileImage, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import VisitTimer from "./VisitTimer";

export type VisitStatus = "Upcoming" | "Arrived" | "completed" | "cancelled";

export interface VisitProps {
  id: string;
  visitorName: string;
  purpose: string;
  contactInfo: string;
  scheduledAt: Date;
  scheduledTime: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: VisitStatus;
  hostName: string;
  hostAddress?: string;
  guardCode?: string;  // Guard code who checked in the visitor
  arrivedAt?: string;  // Time when visitor arrived
  guardName?: string;  // Name of the guard who checked in the visitor
  image?: string;      // Base64 image of visitor ID
  imageId?: number;    // ID of the visitor's image
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onCancel?: () => void;
}

const VisitCard: React.FC<VisitProps> = ({
  visitorName,
  purpose,
  contactInfo,
  scheduledAt,
  scheduledTime,
  checkInTime,
  checkOutTime,
  status,
  hostName,
  hostAddress,
  guardName,
  arrivedAt,
  image,
  imageId,
  onCheckIn,
  onCancel
}) => {
  const [isTimerActive, setIsTimerActive] = useState<boolean>(status === "Arrived");
  const [finalDuration, setFinalDuration] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<VisitStatus>(status);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);

  const getImageSrc = (imageData) => {
    if (!imageData) return null;
    if (imageData.startsWith('data:image')) {
      return imageData;
    }
    try {
      return `data:image/jpeg;base64,${imageData}`;
    } catch (error) {
      console.error("Error decoding image:", error);
      return null;
    }
  };

  const decodedImage = getImageSrc(image);

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case "Upcoming": return "Upcoming";
      case "Arrived": return "Arrived";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return "Unknown";
    }
  };

  const formatScheduledTime = (time: any): string => {
    if (typeof time !== 'string') {
      time = String(time);
    }
    if(time === 'null') {time = '00:00'}

    const paddedTime = time.padStart(4, '0'); 
    const hours = paddedTime.slice(0, -2); 
    const minutes = paddedTime.slice(-2);
    
    return `${hours}${minutes}`;
  };

  const handleTimerStop = (duration: string) => {
    setFinalDuration(duration);
  };

  const handleCheckOut = () => {
    // Stop the timer
    setIsTimerActive(false);
    // Update local status
    setLocalStatus("completed");
  };

  const toggleImageDialog = () => {
    setIsImageDialogOpen(!isImageDialogOpen);
  };

  return (
    <Card className="hover-lift overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold mb-1">{visitorName}</CardTitle>
            <CardDescription>{purpose}</CardDescription>
          </div>
          <Badge>
            {getStatusLabel(localStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Host: </span>
            <span className="ml-1 font-medium">{hostName}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Scheduled: </span>
            <span className="ml-1 font-medium">
              {format(scheduledAt, "MMM d, yyyy")} - {formatScheduledTime(scheduledTime)}
            </span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Host Address: </span>
            <span className="ml-1 font-medium">{hostAddress}</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Transport: </span>
            <span className="ml-1 font-medium">{contactInfo}</span>
          </div>
          {image && (
            <div className="flex items-center mt-2">
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={toggleImageDialog}
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    View ID
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                      <span>Visitor ID - {visitorName}</span>
                      <DialogClose asChild>
                        {/* <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full" 
                          onClick={toggleImageDialog}
                        > */}
                          {/* <X className="h-4 w-4" /> */}
                        {/* </Button> */}
                      </DialogClose>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center p-4">
                    {decodedImage ? (
                      <img 
                        src={decodedImage} 
                        alt={`${visitorName}'s ID`} 
                        className="max-w-full max-h-96 object-contain"
                      />
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        Unable to display image
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {/* Only show guard info and arrival time for Arrived status */}
          {(localStatus === "Arrived" || status === "Arrived") && guardName && (
            <>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">Received By: </span>
                <span className="ml-1 font-medium">{guardName}</span>
              </div>
             
              {arrivedAt && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Arrived At: </span>
                  <span className="ml-1 font-medium">{arrivedAt}</span>
                </div>
              )}
            </>
          )}

          {(localStatus === "Arrived" || localStatus === "completed") && (
            <div className="mt-2">
              {/* <VisitTimer 
                startTime={new Date(`${format(scheduledAt, "yyyy-MM-dd")}T${formatScheduledTime(scheduledTime)}`)} 
                isActive={isTimerActive}
                onTimerStop={handleTimerStop}
              /> */}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2 justify-end">
        {localStatus === "Upcoming" && (
          <>
            {/* <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <UserX className="w-4 h-4 mr-1" />
              Cancel
            </Button> */}
            {onCheckIn && (
              <Button
                size="sm"
                onClick={onCheckIn}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Arrived
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};
export default VisitCard;