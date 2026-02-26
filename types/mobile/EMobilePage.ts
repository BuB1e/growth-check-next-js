export enum EMobilePage {
  HOME = "Home",
  LOCATION = "Location",
  PROFILE = "Profile",
  CREATE_CHILD = "Create_Child",
}

export enum EMobilePageThai {
  HOME = "หน้าหลัก",
  LOCATION = "เขต",
  PROFILE = "โปรไฟล์",
  CREATE_CHILD = "เพิ่มข้อมูลเด็กใหม่",
}

export const EMobilePageToThai: Record<EMobilePage, string> = {
  [EMobilePage.HOME]: EMobilePageThai.HOME,
  [EMobilePage.LOCATION]: EMobilePageThai.LOCATION,
  [EMobilePage.PROFILE]: EMobilePageThai.PROFILE,
  [EMobilePage.CREATE_CHILD]: EMobilePageThai.CREATE_CHILD,
};
