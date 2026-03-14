export interface FlyeringEvent {
  id: string;
  title: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  date: string;
  organizerName: string;
  spotsRemaining: number;
  attendees: string[];
  organization: string;
}

export interface NewEventFormData {
  eventName: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  description: string;
  organization?: string;
}
