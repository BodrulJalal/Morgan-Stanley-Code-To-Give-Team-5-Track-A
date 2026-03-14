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
}

export interface NewEventFormData {
  eventName: string;
  address: string;
  lat: number;
  lng: number;
  date: string;
  description: string;
}

export interface NewFlyeringEvent {
  title: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  date: string;
  organizerName?: string;
  spotsRemaining?: number;
}

export interface UserScore {
  userId: string;
  name: string;
  points: number;
  flyersPosted: number;
  eventsJoined: number;
}
