/**
 * Minimal type definitions for the KHVI data model.
 *
 * Supabase is not wired up yet (see AGENTS.md, section 3). These types model
 * the `bookings` table from `detail.md` section 5.2 closely enough to build
 * UI against mock data now, without inventing fields the schema does not have.
 */

export type BookingStatus = "Open" | "Claimed" | "InProgress" | "Completed" | "Cancelled" | "Expired";

export type CancelledBy = "User" | "Interpreter" | "Manager" | "System";

export type Booking = {
  bookingId: string;
  requesterName: string;
  interpreterName: string;
  languageName: string;
  categoryName: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  urgency: "Immediate" | "Scheduled";
  status: BookingStatus;
  scheduledAt: string | null;
  claimedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  userConfirmedDoneAt: string | null;
  interpreterConfirmedDoneAt: string | null;
  cancelledBy: CancelledBy | null;
  cancelReason: string | null;
  requesterPhone: string;
  interpreterPhone: string;
  interpreterExtraContact: string;
};
