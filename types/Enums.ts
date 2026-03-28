export const Role = {
  ADMIN: "ADMIN",
  USER: "USER",
  HEAD: "HEAD",
} as const;

export const RoleTH = {
  ADMIN: "แอดมิน",
  USER: "เจ้าหน้าที่",
  HEAD: "หัวหน้า",
} as const;

export const RoleToThai: Record<Role, string> = {
  [Role.ADMIN]: RoleTH.ADMIN,
  [Role.USER]: RoleTH.USER,
  [Role.HEAD]: RoleTH.HEAD,
};

export type Role = (typeof Role)[keyof typeof Role];

export const Sex = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const SexTH = {
  MALE: "ชาย",
  FEMALE: "หญิง",
} as const;

export const SexToThai: Record<Sex, string> = {
  [Sex.MALE]: SexTH.MALE,
  [Sex.FEMALE]: SexTH.FEMALE,
};

export type Sex = (typeof Sex)[keyof typeof Sex];

// Child location status, not child's growth status
export const Child_status = {
  IN_AREA: "IN_AREA",
  OUT_AREA: "OUT_AREA",
  UNKNOWN: "UNKNOWN",
  DIED: "DIED",
} as const;

// Child location status, not child's growth status
export const Child_status_TH = {
  IN_AREA: "อยู่ในพื้นที่",
  OUT_AREA: "อยู่นอกพื้นที่",
  UNKNOWN: "ไม่ทราบสถานะ",
  DIED: "เสียชีวิต",
};

// Child location status, not child's growth status
export const Child_statusToThai: Record<Child_status, string> = {
  [Child_status.IN_AREA]: Child_status_TH.IN_AREA,
  [Child_status.OUT_AREA]: Child_status_TH.OUT_AREA,
  [Child_status.UNKNOWN]: Child_status_TH.UNKNOWN,
  [Child_status.DIED]: Child_status_TH.DIED,
};

// Child location status, not child's growth status
export type Child_status = (typeof Child_status)[keyof typeof Child_status];

export const DevelopmentStatus = {
  WA_UNDERWEIGHT_FOR_AGE: 'WA_UNDERWEIGHT_FOR_AGE',
  WA_NORMAL_WEIGHT_FOR_AGE: 'WA_NORMAL_WEIGHT_FOR_AGE',
  WA_OVERWEIGHT_FOR_AGE: 'WA_OVERWEIGHT_FOR_AGE',
  HA_STUNTED_FOR_AGE: 'HA_STUNTED_FOR_AGE',
  HA_NORMAL_HEIGHT_FOR_AGE: 'HA_NORMAL_HEIGHT_FOR_AGE',
  HA_TALL_FOR_AGE: 'HA_TALL_FOR_AGE',
  WH_WASTED_FOR_HEIGHT: 'WH_WASTED_FOR_HEIGHT',
  WH_NORMAL: 'WH_NORMAL',
  WH_OVERWEIGHT: 'WH_OVERWEIGHT',
  WH_OBESE: 'WH_OBESE',
  BMI_THIN: 'BMI_THIN',
  BMI_NORMAL: 'BMI_NORMAL',
  BMI_OVERWEIGHT: 'BMI_OVERWEIGHT',
  BMI_OBESE: 'BMI_OBESE'
} as const

export const DevelopmentStatusTH = {
  WA_UNDERWEIGHT_FOR_AGE: 'น้ำหนักต่ำกว่าเกณฑ์ตามอายุ',
  WA_NORMAL_WEIGHT_FOR_AGE: 'น้ำหนักตามเกณฑ์อายุ',
  WA_OVERWEIGHT_FOR_AGE: 'น้ำหนักมากกว่าเกณฑ์ตามอายุ',
  HA_STUNTED_FOR_AGE: 'เตี้ยกว่าเกณฑ์ตามอายุ',
  HA_NORMAL_HEIGHT_FOR_AGE: 'ส่วนยาว/สูงปกติ',
  HA_TALL_FOR_AGE: 'สูงกว่าเกณฑ์ตามอายุ',
  WH_WASTED_FOR_HEIGHT: 'ผอม/น้ำหนักต่ำกว่าเกณฑ์',
  WH_NORMAL: 'สมส่วน',
  WH_OVERWEIGHT: 'น้ำหนักเกิน',
  WH_OBESE: 'อ้วน',
  BMI_THIN: 'ผอม',
  BMI_NORMAL: 'ปกติ',
  BMI_OVERWEIGHT: 'น้ำหนักเกิน',
  BMI_OBESE: 'อ้วน'
} as const

export const DevelopmentStatusToThai: Record<DevelopmentStatus, string> = {
  [DevelopmentStatus.WA_UNDERWEIGHT_FOR_AGE]: DevelopmentStatusTH.WA_UNDERWEIGHT_FOR_AGE,
  [DevelopmentStatus.WA_NORMAL_WEIGHT_FOR_AGE]: DevelopmentStatusTH.WA_NORMAL_WEIGHT_FOR_AGE,
  [DevelopmentStatus.WA_OVERWEIGHT_FOR_AGE]: DevelopmentStatusTH.WA_OVERWEIGHT_FOR_AGE,
  [DevelopmentStatus.HA_STUNTED_FOR_AGE]: DevelopmentStatusTH.HA_STUNTED_FOR_AGE,
  [DevelopmentStatus.HA_NORMAL_HEIGHT_FOR_AGE]: DevelopmentStatusTH.HA_NORMAL_HEIGHT_FOR_AGE,
  [DevelopmentStatus.HA_TALL_FOR_AGE]: DevelopmentStatusTH.HA_TALL_FOR_AGE,
  [DevelopmentStatus.WH_WASTED_FOR_HEIGHT]: DevelopmentStatusTH.WH_WASTED_FOR_HEIGHT,
  [DevelopmentStatus.WH_NORMAL]: DevelopmentStatusTH.WH_NORMAL,
  [DevelopmentStatus.WH_OVERWEIGHT]: DevelopmentStatusTH.WH_OVERWEIGHT,
  [DevelopmentStatus.WH_OBESE]: DevelopmentStatusTH.WH_OBESE,
  [DevelopmentStatus.BMI_THIN]: DevelopmentStatusTH.BMI_THIN,
  [DevelopmentStatus.BMI_NORMAL]: DevelopmentStatusTH.BMI_NORMAL,
  [DevelopmentStatus.BMI_OVERWEIGHT]: DevelopmentStatusTH.BMI_OVERWEIGHT,
  [DevelopmentStatus.BMI_OBESE]: DevelopmentStatusTH.BMI_OBESE,
}

export type DevelopmentStatus = (typeof DevelopmentStatus)[keyof typeof DevelopmentStatus]

export const Metric_type = {
  WA: "WA",
  HA: "HA",
  BMI: "BMI",
  WH: "WH",
  WL: "WL",
} as const;

export type Metric_type = (typeof Metric_type)[keyof typeof Metric_type];

export const Request_status = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  WAITING: "WAITING",
} as const;

export type Request_status =
  (typeof Request_status)[keyof typeof Request_status];
