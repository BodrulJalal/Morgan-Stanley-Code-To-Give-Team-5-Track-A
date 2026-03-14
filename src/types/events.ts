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
}

export interface NewEventFormData {
  eventName: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  description: string;
}
