export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  HEAD: 'HEAD',
  STAFF: 'STAFF'
} as const

export const RoleTH = {
  ADMIN: 'แอดมิน',
  USER: 'ผู้ใช้งานทั่วไป',
  HEAD: 'หัวหน้า',
  STAFF: 'พนักงาน'
} as const

export const RoleToThai: Record<Role, string> = {
  [Role.ADMIN]: RoleTH.ADMIN,
  [Role.USER]: RoleTH.USER,
  [Role.HEAD]: RoleTH.HEAD,
  [Role.STAFF]: RoleTH.STAFF,
}

export type Role = (typeof Role)[keyof typeof Role]


export const Sex = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
} as const

export const SexTH = {
  MALE: 'ชาย',
  FEMALE: 'หญิง'
} as const

export const SexToThai: Record<Sex, string> = {
  [Sex.MALE]: SexTH.MALE,
  [Sex.FEMALE]: SexTH.FEMALE,
};

export type Sex = (typeof Sex)[keyof typeof Sex]

// Child location status
export const Child_status = {
  IN_AREA: 'IN_AREA',
  OUT_AREA: 'OUT_AREA',
  UNKNOWN: 'UNKNOWN',
  DIED: 'DIED'
} as const

export const Child_status_TH = {
  IN_AREA: 'อยู่ในพื้นที่',
  OUT_AREA: 'อยู่นอกพื้นที่',
  UNKNOWN: 'ไม่ทราบสถานะ',
  DIED: 'เสียชีวิต'
}

// export const DevelopmentStatus = {
//   NORMAL: 'normal',
//   STUNTED: 'stunted',
//   UNDERWEIGHT: 'underweight',
//   OVERWEIGHT: 'overweight',
//   RISK_OVERWEIGHT: 'risk_overweight',
//   RISK_WASTING: 'risk_wasting',
// }

// export const DevelopmentStatusTH = {
//   NORMAL: 'ปกติ',
//   STUNTED: 'เตี้ย',
//   UNDERWEIGHT: 'น้ำหนักน้อยกว่าเกณฑ์',
//   OVERWEIGHT: 'น้ำหนักมากกว่าเกณฑ์',
//   RISK_OVERWEIGHT: 'เสี่ยงน้ำหนักมากเกินเกณฑ์',
//   RISK_WASTING: 'เสี่ยงน้ำหนักน้อยกว่าเกณฑ์',
// }

// export const DevelopmentStatusToThai : Record<DevelopmentStatus, string> = {
//   [DevelopmentStatus.NORMAL]: DevelopmentStatusTH.NORMAL,
//   [DevelopmentStatus.STUNTED]: DevelopmentStatusTH.STUNTED,
//   [DevelopmentStatus.UNDERWEIGHT]: DevelopmentStatusTH.UNDERWEIGHT,
//   [DevelopmentStatus.OVERWEIGHT]: DevelopmentStatusTH.OVERWEIGHT,
//   [DevelopmentStatus.RISK_OVERWEIGHT]: DevelopmentStatusTH.RISK_OVERWEIGHT,
//   [DevelopmentStatus.RISK_WASTING]: DevelopmentStatusTH.RISK_WASTING,
// }

// export type DevelopmentStatus = (typeof DevelopmentStatus)[keyof typeof DevelopmentStatus]

export const Child_statusToThai: Record<Child_status, string> = {
  [Child_status.IN_AREA]: Child_status_TH.IN_AREA,
  [Child_status.OUT_AREA]: Child_status_TH.OUT_AREA,
  [Child_status.UNKNOWN]: Child_status_TH.UNKNOWN,
  [Child_status.DIED]: Child_status_TH.DIED,
};

export type Child_status = (typeof Child_status)[keyof typeof Child_status]


export const Metric_type = {
  WA: 'WA',
  HA: 'HA',
  BMI: 'BMI',
  WH: 'WH',
  WL: 'WL'
} as const

export type Metric_type = (typeof Metric_type)[keyof typeof Metric_type]


export const Request_status = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  WAITING: 'WAITING'
} as const

export type Request_status = (typeof Request_status)[keyof typeof Request_status]
