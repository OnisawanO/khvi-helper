"use client";

import { useRef, useState } from "react";
import type { Booking } from "@/types/database.types";

export type HelperMissionViewProps = {
  booking: Booking;
  onCallInterpreter?: () => void;
  onChatInterpreter?: () => void;
  onConfirm?: () => void | Promise<void>;
  onCancel?: (reason: string) => void | Promise<void>;
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "I") + (parts[1]?.[0] ?? "");
}

function statusText(status: Booking["status"]) {
  if (status === "Completed") return "จบงานแล้ว";
  if (status === "Cancelled") return "ยกเลิกแล้ว";
  if (status === "Expired") return "หมดอายุ";
  if (status === "Open") return "เปิดรับล่าม";
  if (status === "Claimed") return "ล่ามรับงานแล้ว";
  return "กำลังดำเนินการ";
}

function statusClass(status: Booking["status"]) {
  if (status === "Completed") return "status-done";
  if (status === "Cancelled" || status === "Expired") return "status-cancel";
  return "status-progress";
}

function contactUnlocked(status: Booking["status"]) {
  return status === "Claimed" || status === "InProgress" || status === "Completed";
}

export default function HelperMissionView({
  booking,
  onCallInterpreter,
  onChatInterpreter,
  onConfirm,
  onCancel,
}: HelperMissionViewProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unlocked = contactUnlocked(booking.status);
  const userConfirmed = booking.userConfirmedDoneAt !== null;
  const interpreterConfirmed = booking.interpreterConfirmedDoneAt !== null;
  const canConfirm = booking.status === "InProgress" && !userConfirmed;
  const canCancel = booking.status === "Open" || booking.status === "Claimed";

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm?.();
    showToast("ยืนยันจบงานฝั่งผู้ขอแล้ว");
  };

  const handleCancel = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      showToast("กรุณาระบุเหตุผลก่อนยกเลิก");
      return;
    }
    await onCancel?.(reason);
    setCancelOpen(false);
    setCancelReason("");
    showToast("ยกเลิกคำขอเรียบร้อยแล้ว");
  };

  return (
    <div className="khvi-mission-view">
      <main className="page-helper">
        <div className="card role-hero">
          <span className="role-kicker">Requester Workspace · Shared Mission Room</span>
          <div className="mission-head mission-head-spaced">
            <div>
              <p className="mission-id">มุมมองผู้ขอความช่วยเหลือ · ภารกิจ #{booking.bookingId}</p>
              <p className="mission-title">
                {booking.categoryName}
                <span className="title-separator">·</span>
                {booking.languageName}
                <span className="lang-chip">{booking.languageName}</span>
              </p>
              <div className="role-note">
                ติดตามสถานะ ติดต่อกับล่าม และยืนยันจบงานจากข้อมูล Booking ของโปรเจกต์ K-HVI
              </div>
            </div>
            <span className={`status-badge ${statusClass(booking.status)}`}>
              {statusText(booking.status)}
            </span>
          </div>

          <div className="mission-summary">
            <SummaryChip label="Language" value={booking.languageName} />
            <SummaryChip label="Category" value={booking.categoryName} />
            <SummaryChip label="Urgency" value={booking.urgency} />
          </div>
        </div>

        <div className="dashboard-shell">
          <section className="dashboard-main">
            <p className="desktop-section-title">ภารกิจและการติดตาม</p>

            <div className="card">
              <p className="section-label">สถานะคำขอ</p>
              <ul className="timeline">
                <TimelineItem title="สร้างคำขอแล้ว" meta={`ภารกิจ #${booking.bookingId}`} state="done" />
                <TimelineItem
                  title="ล่ามรับงานแล้ว"
                  meta={booking.claimedAt ? formatDateTime(booking.claimedAt) : "รอล่ามรับงาน"}
                  state={booking.claimedAt ? "done" : undefined}
                />
                <TimelineItem
                  title="เริ่มปฏิบัติงาน"
                  meta={booking.startedAt ? formatDateTime(booking.startedAt) : "ยังไม่เริ่มงาน"}
                  state={booking.startedAt ? "done" : booking.status === "InProgress" ? "current" : undefined}
                />
                <TimelineItem
                  title="ยืนยันจบงานทั้งสองฝ่าย"
                  meta={
                    booking.status === "Completed"
                      ? formatDateTime(booking.endedAt)
                      : "รอผู้ขอและล่ามยืนยัน"
                  }
                  state={booking.status === "Completed" ? "done" : undefined}
                />
              </ul>
            </div>

            <div className="card">
              <div className="map-head">
                <p className="section-label section-label-flush">ตำแหน่งภารกิจ</p>
                <span className="live-dot"><span className="dot" />Booking location</span>
              </div>
              <div className="map-frame">
                <svg viewBox="0 0 400 230" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M20,60 C120,40 160,120 230,110 C300,100 330,150 380,150" fill="none" stroke="#BFD6CE" strokeWidth="4" strokeDasharray="1 10" strokeLinecap="round" />
                  <circle cx="90" cy="72" r="5" fill="#12776E" />
                  <circle cx="330" cy="150" r="5" fill="#C24A3F" />
                </svg>
                <div className="map-tag map-tag-mine">🧑‍💼 {unlocked ? booking.interpreterName || "ล่าม" : "รอล่าม"}</div>
                <div className="map-tag dest map-tag-dest">📍 จุดนัดพบ</div>
              </div>
              <div className="eta-strip">
                <span>พิกัด: <strong>{booking.latitude.toFixed(5)}, {booking.longitude.toFixed(5)}</strong></span>
                <span>{booking.locationName}</span>
              </div>
            </div>
          </section>

          <aside className="dashboard-side">
            <p className="desktop-section-title">ข้อมูลและการดำเนินการ</p>

            <div className="card">
              <p className="section-label">รายละเอียดคำขอ</p>
              <InfoRow label="รายละเอียด" value={booking.description} />
              <InfoRow label="จุดนัดพบ" value={booking.locationName} />
              <InfoRow label="นัดหมาย" value={booking.scheduledAt ? formatDateTime(booking.scheduledAt) : "ทันที / ไม่มีเวลานัด"} />
              <div className="divider" />

              {unlocked ? (
                <>
                  <div className="person">
                    <div className="avatar">{initials(booking.interpreterName || "Interpreter")}</div>
                    <div>
                      <div className="pname">{booking.interpreterName || "Interpreter"}</div>
                      <div className="pmeta">
                        {[booking.interpreterPhone, booking.interpreterExtraContact].filter(Boolean).join(" · ") || "ไม่มีข้อมูลติดต่อ"}
                      </div>
                    </div>
                  </div>
                  <div className="contact-links">
                    <button className="link-btn" onClick={() => { onCallInterpreter?.(); showToast("เปิดช่องทางโทรหาล่าม"); }}>
                      โทรหาล่าม
                    </button>
                    <button className="link-btn" onClick={() => { onChatInterpreter?.(); showToast("เปิดช่องทางติดต่อเพิ่มเติม"); }}>
                      ติดต่อเพิ่มเติม
                    </button>
                  </div>
                </>
              ) : (
                <div className="person">
                  <div className="avatar">🔒</div>
                  <div>
                    <div className="pname">ข้อมูลล่ามยังถูกล็อก</div>
                    <div className="pmeta">ชื่อและข้อมูลติดต่อจะแสดงหลังจากล่ามรับงาน</div>
                  </div>
                </div>
              )}
            </div>

            <div className="card confirm-card">
              <p className="section-label">ยืนยันจบงาน</p>
              <p className="confirm-note">ภารกิจจะปิดเมื่อทั้งสองฝ่ายยืนยัน</p>
              <div className="confirm-row">
                <span>ผู้ขอความช่วยเหลือ (คุณ)</span>
                <span className={`confirm-state ${userConfirmed ? "done" : "waiting"}`}>
                  {userConfirmed ? "ยืนยันแล้ว" : "รอการยืนยัน"}
                </span>
              </div>
              <div className="confirm-row">
                <span>ล่าม</span>
                <span className={`confirm-state ${interpreterConfirmed ? "done" : "waiting"}`}>
                  {interpreterConfirmed ? "ยืนยันแล้ว" : "รอการยืนยัน"}
                </span>
              </div>
              <button className="btn-confirm-all" onClick={handleConfirm} disabled={!canConfirm}>
                {booking.status === "Completed" ? "ภารกิจปิดแล้ว" : userConfirmed ? "รอล่ามยืนยัน" : "ยืนยันงานเสร็จแล้ว"}
              </button>
            </div>

            <div className="card cancel-card">
              <p className="section-label">ยกเลิกคำขอ</p>
              <p>ยกเลิกได้ในช่วง Open หรือ Claimed และระบบจะบันทึกเหตุผลไว้ใน Booking</p>
              <div className="cancel-meta">
                <span>สถานะ: {booking.status}</span>
                <button className="btn-cancel-open" onClick={() => setCancelOpen(true)} disabled={!canCancel}>
                  ยกเลิกคำขอ
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {cancelOpen && (
        <div className="overlay open" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCancelOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
            <h3 id="cancel-title">ยืนยันการยกเลิกคำขอ</h3>
            <p>โปรดระบุเหตุผลโดยย่อ</p>
            <textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="เช่น เปลี่ยนแผน หรือไม่ต้องการล่ามแล้ว" />
            <div className="btn-row">
              <button className="btn btn-outline" onClick={() => setCancelOpen(false)}>กลับ</button>
              <button className="btn btn-outline-danger danger-solid" onClick={handleCancel}>ยืนยันยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
      <style jsx global>{missionStyles}</style>
    </div>
  );
}

function TimelineItem({ title, meta, state }: { title: string; meta: string; state?: "done" | "current" }) {
  return <li className={`tl-item ${state ?? ""}`}><div className="tl-rail"><div className="tl-dot" /></div><div className="tl-body"><div className="tl-title">{title}</div><div className="tl-meta">{meta}</div></div></li>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><div className="k">{label}</div><div className="v">{value}</div></div>;
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return <div className="summary-chip"><div className="label">{label}</div><div className="value">{value}</div></div>;
}

const missionStyles = `
.khvi-mission-view{--navy:#092f45;--navy-2:#10283a;--teal:#4d8a93;--teal-deep:#3d727a;--amber:#f0a35f;--amber-bg:#fff4e8;--green:#759284;--green-bg:#edf4f0;--red:#f04f3e;--red-bg:#fff0ed;--ink:#10283a;--ink-soft:#5f7280;--line:#dce4e8;--paper:#f7f9fa;--card:#fff;--radius:16px;--focus:#f0a35f;color:var(--ink);font-family:"Noto Sans Thai","Segoe UI",Arial,Helvetica,sans-serif}
.khvi-mission-view *{box-sizing:border-box}.khvi-mission-view button,.khvi-mission-view textarea{font:inherit}.khvi-mission-view button{cursor:pointer}.khvi-mission-view button:disabled{cursor:not-allowed}.khvi-mission-view :focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.khvi-mission-view main{width:100%;max-width:none;margin:0;padding:12px 12px 88px}.khvi-mission-view .card{position:relative;background:var(--card);border:1px solid rgba(16,40,58,.08);border-radius:16px;padding:14px;box-shadow:0 12px 32px rgba(16,40,58,.08)}
.khvi-mission-view .role-hero{margin-bottom:14px}.khvi-mission-view .role-kicker{display:inline-flex;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#477d84;background:#edf5f6;border:1px solid #d2e4e6;padding:5px 9px;border-radius:999px}.khvi-mission-view .mission-head{display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:10px}.khvi-mission-view .mission-head-spaced{margin-top:12px}.khvi-mission-view .mission-id{font-size:12.5px;color:var(--ink-soft);margin:0 0 4px}.khvi-mission-view .mission-title{font-size:18px;line-height:1.35;font-weight:600;margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--navy)}.khvi-mission-view .title-separator{color:var(--ink-soft);font-weight:400}.khvi-mission-view .lang-chip{font-size:12px;font-weight:500;color:#325f66;background:#edf5f6;border:1px solid #d2e4e6;padding:2px 9px;border-radius:7px}.khvi-mission-view .role-note{font-size:12px;color:var(--ink-soft);margin-top:6px}.khvi-mission-view .status-badge{font-size:12px;font-weight:600;padding:5px 11px;border-radius:999px;white-space:nowrap}.khvi-mission-view .status-progress{background:#fff2e5;color:#b66e2e}.khvi-mission-view .status-cancel{background:#fff0ed;color:#d64637}.khvi-mission-view .status-done{background:#edf4f0;color:#587466}.khvi-mission-view .mission-summary{display:grid;grid-template-columns:1fr;gap:8px;margin-top:14px}.khvi-mission-view .summary-chip{padding:10px 12px;border:1px solid #e0e7ea;border-radius:11px;background:#fafcfc}.khvi-mission-view .summary-chip .label{font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:#84939a;font-weight:700}.khvi-mission-view .summary-chip .value{font-size:13px;color:var(--navy);font-weight:700;margin-top:2px}
.khvi-mission-view .dashboard-shell{display:grid;grid-template-columns:1fr;gap:14px}.khvi-mission-view .dashboard-main,.khvi-mission-view .dashboard-side{display:flex;flex-direction:column;gap:14px;min-width:0}.khvi-mission-view .desktop-section-title{display:none}.khvi-mission-view .section-label{font-size:14px;font-weight:600;margin:0 0 12px;color:var(--navy)}.khvi-mission-view .section-label-flush{margin:0}.khvi-mission-view .timeline{list-style:none;margin:0;padding:2px 0 0}.khvi-mission-view .tl-item{display:grid;grid-template-columns:18px 1fr;column-gap:10px;position:relative;padding-bottom:18px}.khvi-mission-view .tl-item:last-child{padding-bottom:0}.khvi-mission-view .tl-rail{position:relative;display:flex;justify-content:center}.khvi-mission-view .tl-dot{width:11px;height:11px;border-radius:50%;background:var(--line);margin-top:3px;z-index:1}.khvi-mission-view .tl-rail:after{content:"";position:absolute;top:14px;bottom:-18px;width:2px;background:var(--line)}.khvi-mission-view .tl-item:last-child .tl-rail:after{display:none}.khvi-mission-view .tl-item.done .tl-dot,.khvi-mission-view .tl-item.done .tl-rail:after{background:var(--teal)}.khvi-mission-view .tl-item.current .tl-dot{background:var(--amber);box-shadow:0 0 0 4px #fff0e3}.khvi-mission-view .tl-title{font-size:14px;font-weight:500}.khvi-mission-view .tl-item:not(.done):not(.current) .tl-title{color:#9aa8a4}.khvi-mission-view .tl-meta{font-size:12px;color:var(--ink-soft);margin-top:2px}
.khvi-mission-view .map-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px}.khvi-mission-view .live-dot{display:flex;align-items:center;gap:6px;font-size:11px;white-space:nowrap;color:#477d84;font-weight:500}.khvi-mission-view .live-dot .dot{width:7px;height:7px;border-radius:50%;background:var(--teal);animation:khviPulse 1.8s ease-in-out infinite}.khvi-mission-view .map-frame{position:relative;height:190px;border-radius:10px;overflow:hidden;background:radial-gradient(circle at 25% 30%,rgba(77,138,147,.13),transparent 34%),linear-gradient(145deg,#f2f6f7 0%,#eaf1f2 100%);border:1px solid #dbe5e8}.khvi-mission-view .map-frame svg{position:absolute;inset:0;width:100%;height:100%}.khvi-mission-view .map-tag{position:absolute;background:var(--navy);color:#fff;font-size:10.5px;padding:4px 7px;border-radius:8px;white-space:nowrap;transform:translate(-50%,-135%);max-width:45%;overflow:hidden;text-overflow:ellipsis;box-shadow:0 8px 20px rgba(9,47,69,.18)}.khvi-mission-view .map-tag.dest{background:#fff;color:var(--navy);border:1px solid #d7e0e4}.khvi-mission-view .map-tag-mine{left:22.5%;top:31%}.khvi-mission-view .map-tag-dest{left:82.5%;top:65%}.khvi-mission-view .eta-strip{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-top:12px;font-size:12px;color:var(--ink-soft)}.khvi-mission-view .eta-strip strong{color:var(--ink)}
.khvi-mission-view .info-row{display:flex;flex-direction:column;gap:2px;font-size:13px;margin-bottom:12px}.khvi-mission-view .info-row .k{font-size:12px;font-weight:700;color:#6a7b84}.khvi-mission-view .info-row .v{line-height:1.5;font-weight:500}.khvi-mission-view .divider{height:1px;background:var(--line);margin:14px 0}.khvi-mission-view .person{display:flex;align-items:flex-start;gap:12px;padding:12px;border:1px solid rgba(16,40,58,.08);border-radius:12px;background:#f8fafb}.khvi-mission-view .avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,var(--navy),var(--teal));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0}.khvi-mission-view .pname{font-weight:600;font-size:14px}.khvi-mission-view .pmeta{font-size:12px;color:var(--ink-soft);margin-top:2px;word-break:break-word}.khvi-mission-view .contact-links,.khvi-mission-view .btn-row{display:grid;grid-template-columns:1fr;gap:9px}.khvi-mission-view .contact-links{margin-top:10px}.khvi-mission-view .link-btn,.khvi-mission-view .btn,.khvi-mission-view .btn-confirm-all,.khvi-mission-view .btn-cancel-open{min-height:46px;width:100%;border-radius:10px;font-size:14px;font-weight:600}.khvi-mission-view .link-btn{border:1px solid #dce4e8;background:#f8fafb;color:var(--navy)}.khvi-mission-view .btn{padding:12px;border:1px solid transparent}.khvi-mission-view .btn-outline{background:#fff;border-color:var(--line);color:var(--ink)}.khvi-mission-view .btn-outline-danger,.khvi-mission-view .btn-cancel-open{background:#fff;border:1px solid #f2b2aa;color:#d64637}.khvi-mission-view .danger-solid{background:var(--red);color:#fff}
.khvi-mission-view .confirm-card,.khvi-mission-view .cancel-card{box-shadow:none}.khvi-mission-view .confirm-card{background:#f7fbf9;border-color:#d9e7e0;border-left:4px solid #759284}.khvi-mission-view .confirm-card .section-label{color:#587466}.khvi-mission-view .confirm-note{font-size:12px;color:#3e7a5c;margin:0 0 4px}.khvi-mission-view .confirm-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;padding:9px 0;border-bottom:1px dashed #d9e7e0}.khvi-mission-view .confirm-state{font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;flex-shrink:0}.khvi-mission-view .confirm-state.waiting{background:#fff0df;color:#9a622b}.khvi-mission-view .confirm-state.done{background:#e7f0eb;color:#587466}.khvi-mission-view .btn-confirm-all{margin-top:12px;border:none;padding:12px;background:var(--navy);color:#fff;box-shadow:0 10px 22px rgba(9,47,69,.16)}.khvi-mission-view .btn-confirm-all:disabled{background:#b9cfc9;box-shadow:none}.khvi-mission-view .cancel-card{border-color:#f2d1cc;border-left:4px solid #f04f3e}.khvi-mission-view .cancel-card .section-label{color:#d64637;margin-bottom:6px}.khvi-mission-view .cancel-card p{font-size:12.5px;color:var(--ink-soft);line-height:1.6}.khvi-mission-view .cancel-meta{display:flex;flex-direction:column;align-items:stretch;gap:10px;font-size:12.5px;color:var(--ink-soft);padding-top:14px;border-top:1px solid var(--line)}.khvi-mission-view .btn-cancel-open{padding:8px 16px}
.khvi-mission-view .overlay{position:fixed;inset:0;background:rgba(15,25,23,.45);display:flex;align-items:flex-end;justify-content:center;z-index:50}.khvi-mission-view .modal{background:#fff;width:100%;max-width:640px;max-height:88vh;overflow:auto;border-radius:16px 16px 0 0;padding:18px 14px 16px;border:1px solid rgba(16,40,58,.08);box-shadow:0 20px 48px rgba(16,40,58,.12)}.khvi-mission-view .modal h3{margin:0 0 6px;font-size:17px}.khvi-mission-view .modal p{margin:0 0 14px;font-size:13px;color:var(--ink-soft)}.khvi-mission-view .modal textarea{width:100%;min-height:96px;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:16px;resize:vertical;margin-bottom:14px}.khvi-mission-view .toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:var(--navy);color:#fff;font-size:13px;padding:11px 18px;border-radius:999px;opacity:0;pointer-events:none;transition:.25s;z-index:60;max-width:calc(100vw - 24px);text-align:center}.khvi-mission-view .toast.show{opacity:1;transform:translateX(-50%) translateY(-4px)}
@keyframes khviPulse{0%,100%{opacity:1}50%{opacity:.35}}@media(prefers-reduced-motion:reduce){.khvi-mission-view .live-dot .dot{animation:none}}
@media(min-width:600px){.khvi-mission-view main{max-width:680px;margin:0 auto;padding:18px 18px 100px}.khvi-mission-view .card{padding:18px}.khvi-mission-view .mission-head{flex-direction:row}.khvi-mission-view .mission-title{font-size:21px}.khvi-mission-view .mission-summary{grid-template-columns:repeat(3,1fr)}.khvi-mission-view .map-frame{height:230px}.khvi-mission-view .map-tag{font-size:12px;max-width:none;padding:5px 10px}.khvi-mission-view .eta-strip{flex-direction:row;align-items:center;justify-content:space-between}.khvi-mission-view .info-row{flex-direction:row;gap:10px;font-size:13.5px;margin-bottom:10px}.khvi-mission-view .info-row .k{min-width:108px;font-size:13.5px}.khvi-mission-view .contact-links,.khvi-mission-view .btn-row{display:flex}.khvi-mission-view .cancel-meta{flex-direction:row;align-items:center;justify-content:space-between}.khvi-mission-view .btn-cancel-open{width:auto;min-height:40px}}
@media(min-width:1024px){.khvi-mission-view main{max-width:1280px;padding:28px 24px 72px}.khvi-mission-view .role-hero{margin-bottom:20px}.khvi-mission-view .dashboard-shell{grid-template-columns:minmax(0,1.55fr) minmax(340px,.85fr);gap:22px;align-items:start}.khvi-mission-view .dashboard-main,.khvi-mission-view .dashboard-side{gap:18px}.khvi-mission-view .dashboard-side{position:sticky;top:96px}.khvi-mission-view .desktop-section-title{display:block;margin:0 0 -6px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#84939a}.khvi-mission-view .card{padding:22px}.khvi-mission-view .map-frame{height:390px}.khvi-mission-view .mission-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.khvi-mission-view .dashboard-side .info-row{flex-direction:column;gap:3px;margin-bottom:14px}.khvi-mission-view .dashboard-side .info-row .k{min-width:0;font-size:11.5px;text-transform:uppercase}}
`;
