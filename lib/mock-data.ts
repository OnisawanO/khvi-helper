import type { Booking } from "@/types/database.types";

/**
 * Mock Mode data (see detail.md section 6.1). Supabase is not connected yet,
 * so `app/mission/[id]/page.tsx` reads from here instead of a real query.
 * Replace with a Supabase fetch once `bookings` exists in the database.
 */
const mockBookings: Record<string, Booking> = {
  "1001": {
    bookingId: "1001",
    requesterName: "A-Chen Lin",
    interpreterName: "Suda Boonmee",
    languageName: "Chinese",
    categoryName: "Medical",
    description: "Follow-up appointment at the outpatient clinic, need help explaining medication dosage.",
    locationName: "Maharaj Nakhon Si Thammarat Hospital, OPD building",
    latitude: 8.4304,
    longitude: 99.9631,
    urgency: "Immediate",
    status: "InProgress",
    scheduledAt: null,
    claimedAt: "2026-09-07T08:12:00+07:00",
    startedAt: "2026-09-07T08:40:00+07:00",
    endedAt: null,
    userConfirmedDoneAt: null,
    interpreterConfirmedDoneAt: null,
    cancelledBy: null,
    cancelReason: null,
    requesterPhone: "081-234-5678",
    interpreterPhone: "089-876-5432",
    interpreterExtraContact: "Line ID: suda.helps",
  },
};

export function getMockBooking(bookingId: string): Booking | null {
  return mockBookings[bookingId] ?? null;
}
