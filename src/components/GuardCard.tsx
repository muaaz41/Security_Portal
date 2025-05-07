
import React from "react";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  Clock,
  PhoneCall,
  Mail
} from "lucide-react";

export type GuardStatus = "on-duty" | "off-duty" | "on-leave";

export interface GuardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: GuardStatus;
  shift?: {
    start: string;
    end: string;
  };
  avatarUrl?: string;
  onEdit?: () => void;
  onAssign?: () => void;
}

const GuardCard: React.FC<GuardProps> = ({
  name,
  email,
  phone,
  position,
  status,
  shift,
  avatarUrl,
  onEdit,
  onAssign
}) => {
  const getStatusColor = (status: GuardStatus) => {
    switch (status) {
      case "on-duty": return "bg-green-100 text-green-800";
      case "off-duty": return "bg-gray-100 text-gray-800";
      case "on-leave": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: GuardStatus) => {
    switch (status) {
      case "on-duty": return "On Duty";
      case "off-duty": return "Off Duty";
      case "on-leave": return "On Leave";
      default: return "";
    }
  };

  return (
    <Card className="hover-lift overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{position}</p>
            </div>
          </div>
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid gap-2 text-sm">
          {shift && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Shift: </span>
              <span className="ml-1 font-medium">
                {shift.start} - {shift.end}
              </span>
            </div>
          )}
          <div className="flex items-center">
            <PhoneCall className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="ml-1">{phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="ml-1">{email}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex gap-2 justify-end">
        {/* <Button 
          size="sm" 
          variant="outline" 
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button 
          size="sm" 
          onClick={onAssign}
          variant="default"
        >
          Assign
        </Button> */}
      </CardFooter>
    </Card>
  );
};

export default GuardCard;
