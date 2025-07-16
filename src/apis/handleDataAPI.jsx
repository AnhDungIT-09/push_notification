import axiosClient from "./axiosClient";
import axiosClientGet from "./axiosClientGet";

const END_POINT = {
  GET_STATS: "getStats.php",
  PHONG_BAN: "apiPhongban.php",
  QUYEN: "apiQuyen.php",
  USER: "apiUser.php",
  CHECK_LIST: "apiCheckListHangNgay.php",
  NOI_QUY: "apiNoiquy.php",
  DON_HANG: "apiDonhang.php",
  XIN_PHEP: "client/xin_phep.php",
  XANG_DAU: "client/apiGetAllXangDau.php",
  GIAO_HANG_3_BEN: "client/apiKyXacNhanGiaoHang.php",
  CHAM_CONG_TIME: "apiTimeChamCong.php",
  CHAM_CONG: "apiGetChamCong.php",
  DIEU_DONG: "apiQuanLyCongViecDieuDong.php",
  PHU_CAP_PHONG_BAN: "apiPhuCapPhongBan.php",
  LUONG: "apiLuong.php",
  THONG_BAO: "apiThongBao.php",
  ACTION_LUONG: "apiActionLuong.php",
};
export const apiThongBao = (data) => {
  return axiosClient.post(END_POINT.THONG_BAO, data);
};
export const apiLuong = (data) => {
  return axiosClient.post(END_POINT.LUONG, data);
};
export const apiActionLuong = (data) => {
  return axiosClient.post(END_POINT.ACTION_LUONG, data);
};

export const apiPhuCapPhongBan = (data) => {
  return axiosClient.post(END_POINT.PHU_CAP_PHONG_BAN, data);
};

export const apiDieuDong = (data) => {
  return axiosClient.post(END_POINT.DIEU_DONG, data);
};

export const apiChamCong = (data) => {
  return axiosClient.post(END_POINT.CHAM_CONG, data);
};

export const apiChamCongTime = (data) => {
  return axiosClient.post(END_POINT.CHAM_CONG_TIME, data);
};

export const apiGiaoHang3Ben = (data) => {
  return axiosClient.post(END_POINT.GIAO_HANG_3_BEN, data);
};

export const apiXangDau = (data) => {
  return axiosClient.post(END_POINT.XANG_DAU, data);
};

export const apiNghiPhep = (data) => {
  return axiosClient.post(END_POINT.XIN_PHEP, data);
};

export const apiDonhang = (data) => {
  return axiosClient.post(END_POINT.DON_HANG, data);
};

export const apiNoiquy = (data) => {
  return axiosClient.post(END_POINT.NOI_QUY, data);
};

export const apiCheckList = (data) => {
  return axiosClient.get(END_POINT.CHECK_LIST, data);
};

export const apiUser = (data) => {
  return axiosClient.post(END_POINT.USER, data);
};

export const apiQuyen = (data) => {
  return axiosClient.post(END_POINT.QUYEN, data);
};

export const apiPhongban = (data) => {
  return axiosClient.post(END_POINT.PHONG_BAN, data);
};

export const apiGetStats = (data) => {
  return axiosClientGet.get(END_POINT.GET_STATS, data);
};
