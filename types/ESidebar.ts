export enum ESidebar {
    DASHBOARD = "Dashboard",
    LOCATION = "Location",
    STAFF = "Staff",
    CHILD = "Children",
    REQUEST = "Request",
    USER_REQUEST = "UserRequest",
    HISTORY = "History",
    GROWTH_REFERENCE = "GrowthReference",
    DEVELOPMENT = "Development",
}

export enum ESidebarThai {
    DASHBOARD = "แดชบอร์ด",
    LOCATION = "ข้อมูลชุมชน",
    STAFF = "ข้อมูลเจ้าหน้าที่",
    CHILD = "ข้อมูลเด็ก",
    REQUEST = "คำร้องขอ",
    USER_REQUEST = "คำร้องเปิดบัญชี",
    HISTORY = "ประวัติ",
    GROWTH_REFERENCE = "เกณฑ์มาตรฐานการเจริญเติบโต",
    DEVELOPMENT = "คำแนะนำพัฒนาการ",
}

export const ESidebarToThai: Record<ESidebar, string> = {
  [ESidebar.DASHBOARD]: ESidebarThai.DASHBOARD,
  [ESidebar.LOCATION]: ESidebarThai.LOCATION,
  [ESidebar.STAFF]: ESidebarThai.STAFF,
  [ESidebar.CHILD]: ESidebarThai.CHILD,
  [ESidebar.REQUEST]: ESidebarThai.REQUEST,
  [ESidebar.USER_REQUEST]: ESidebarThai.USER_REQUEST,
  [ESidebar.HISTORY]: ESidebarThai.HISTORY,
  [ESidebar.GROWTH_REFERENCE]: ESidebarThai.GROWTH_REFERENCE,
  [ESidebar.DEVELOPMENT]: ESidebarThai.DEVELOPMENT,
};
