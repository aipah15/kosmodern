export type AuthScreen =
  | "login"
  | "invite"
  | "complete-profile"
  | "success"
  | "forgot-password";

export interface InvitationData {
  id: string;
  code: string;
  room_id: string;
  is_used: boolean;
  room?: {
    id: string;
    room_number: string;
    floor: string;
    room_type: string;
    property_name: string;
    property_address: string;
    price: number;
  };
}

export interface UserRegisteredData {
  fullName: string;
  email: string;
  phone: string;
  nik: string;
  propertyName: string;
  roomNumber: string;
  floor: string;
  invitationCode: string;
}
