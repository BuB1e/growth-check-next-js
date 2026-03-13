export enum ESidebar {
    DASHBOARD = "Dashboard",
    LOCATION = "Location",
    STAFF = "Staff",
    CHILD = "Children",
    REQUEST = "Request",
    HISTORY = "History",
}

export enum ESidebarThai {
    DASHBOARD = "แดชบอร์ด",
    LOCATION = "ข้อมูลชุมชน",
    STAFF = "ข้อมูลเจ้าหน้าที่",
    CHILD = "ข้อมูลเด็ก",
    REQUEST = "คำร้องขอ",
    HISTORY = "ประวัติ",
}

export const ESidebarToThai: Record<ESidebar, string> = {
  [ESidebar.DASHBOARD]: ESidebarThai.DASHBOARD,
  [ESidebar.LOCATION]: ESidebarThai.LOCATION,
  [ESidebar.STAFF]: ESidebarThai.STAFF,
  [ESidebar.CHILD]: ESidebarThai.CHILD,
  [ESidebar.REQUEST]: ESidebarThai.REQUEST,
  [ESidebar.HISTORY]: ESidebarThai.HISTORY,
};
