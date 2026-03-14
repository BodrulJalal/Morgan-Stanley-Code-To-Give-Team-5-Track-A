export interface FlyeringEvent {
  id: string;
  title: string;
  lat: number;
  lng: number;
  date: string;
  organizerName: string;
  spotsRemaining: number;
}

export interface NewEventFormData {
  eventName: string;
  lat: number;
  lng: number;
  date: string;
}
