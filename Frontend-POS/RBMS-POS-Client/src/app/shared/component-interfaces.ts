/* ═══════════════════════════════════════════════════════════════════════════
   Shared Component Interfaces

   ลำดับหมวดหมู่:
   1. Layout — CurrentUser, MenuItem, BreadcrumbItem
   2. Button — Pbutton, BreadcrumbButton
   3. Dropdown / Filter — ActiveStatusOption, SelectOption, DropdownOption
   4. Table — TooltipColumn
   5. Dashboard — CardConfig, DashboardLayout
   6. Types — DateFormatMode, PasswordStrength
   7. Constants — DAY_LABELS, TH_MONTHS, TH_DAYS
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── 1. Layout ──────────────────────────────────────────────────────────────

export interface CurrentUser {
  username: string;
  positionName?: string;
  nickname?: string;
  profileImage?: string;
}

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  permissions?: string[];
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

// ─── 2. Button ──────────────────────────────────────────────────────────────

export interface Pbutton {
  key: string;
  label?: string;
  severity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast';
  size?: 'small' | 'large';
  variant?: 'text' | 'outlined';
  rounded?: boolean;
  raised?: boolean;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  styleClass?: string;
  callback?: () => void;
  tieredMenu?: any[];
  badge?: string;
}

export interface BreadcrumbButton {
  key: string;
  type: 'button' | 'buttonTieredMenu';
  item: Pbutton;
}

// ─── 3. Dropdown / Filter ───────────────────────────────────────────────────

/** ตัวเลือกกรองสถานะ Active/Inactive สำหรับ dropdown ในหน้า list */
export interface ActiveStatusOption {
  label: 'Active' | 'Inactive';
  value: boolean;
}

/** ตัวเลือก dropdown ทั่วไป รองรับชื่อไทย-อังกฤษ (เช่น หมวดหมู่, ตำแหน่ง) */
export interface SelectOption {
  thName: string;
  enName: string;
  value: number | string;
}

/** ตัวเลือก dropdown แบบ label-value (เช่น เลือกโต๊ะ, เลือกประเภท) */
export interface DropdownOption {
  label: string;
  value: number | string;
}

// ─── 4. Table ───────────────────────────────────────────────────────────────

/** กำหนด tooltip สำหรับคอลัมน์ใน table (ตำแหน่ง + เนื้อหา) */
export interface TooltipColumn {
  tooltipPosition?: 'right' | 'left' | 'top' | 'bottom' | string | undefined;
  content?: string;
}

// ─── 5. Dashboard ───────────────────────────────────────────────────────────

/** กำหนดค่า card ในหน้า Dashboard (สี, icon, layout, จำนวน) */
export interface CardConfig {
  header: string;
  icon?: string;
  isActive: boolean;
  stateColor: 1 | 2 | 3 | 4;
  isJustifyEnd?: boolean;
  isCountJustifyEnd?: boolean;
  isSpaceBetween?: boolean;
  count?: number;
  layoutType: 'single' | 'double';
  cssClass?: string;
}

/** โครงสร้าง layout หน้า Dashboard ประกอบด้วย cards */
export interface DashboardLayout {
  cards: CardConfig[];
}

// ─── 6. Types ───────────────────────────────────────────────────────────────

export type DateFormatMode =
  | 'DATE'
  | 'TIME'
  | 'DATE_TIME'
  | 'MONTH'
  | 'DAY'
  | 'thLongDate';

export type PasswordStrength = 'weak' | 'medium' | 'strong';

// ─── 7. Constants ───────────────────────────────────────────────────────────

/** วันจันทร์-อาทิตย์ key 1-7 (ISO weekday) — สำหรับ business logic เช่น เวลาเปิด-ปิดร้าน */
export const DAY_LABELS: Record<number, string> = {
  1: 'จันทร์',
  2: 'อังคาร',
  3: 'พุธ',
  4: 'พฤหัสบดี',
  5: 'ศุกร์',
  6: 'เสาร์',
  7: 'อาทิตย์',
};

/** ชื่อเดือนภาษาไทย index 0-11 — สำหรับ DateFormatPipe */
export const TH_MONTHS: string[] = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/** ชื่อวันภาษาไทย index 0-6 (JS Date.getDay(): อาทิตย์=0) — สำหรับ DateFormatPipe */
export const TH_DAYS: string[] = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
];
