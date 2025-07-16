import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://trafficnhanh.com/",
  headers: {
    "Content-Type": "application/json",
    API_KEY: "LFTJV45qCr",
  },
});

export default axiosClient;
