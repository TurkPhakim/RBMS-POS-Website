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

// --- Pbutton (shared button config for Header + Breadcrumb) ---

export interface Pbutton {
  key: string;
  label?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast';
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

// --- Dropdown / Filter options ---

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

// --- Table ---

/** กำหนด tooltip สำหรับคอลัมน์ใน table (ตำแหน่ง + เนื้อหา) */
export interface TooltipColumn {
  tooltipPosition?: 'right' | 'left' | 'top' | 'bottom' | string | undefined;
  content?: string;
}

// --- Dashboard ---

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
