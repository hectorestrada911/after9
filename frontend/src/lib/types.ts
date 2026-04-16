export type Visibility = "public" | "private";
export type AgeRestriction = "all_ages" | "age_18_plus" | "age_21_plus";

export interface EventInput {
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  ticketPrice: number;
  ticketsAvailable: number;
  visibility: Visibility;
  ageRestriction: AgeRestriction;
  dressCode?: string;
  instructions?: string;
  locationNote?: string;
}
