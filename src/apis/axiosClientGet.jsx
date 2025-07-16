import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://trafficnhanh.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
