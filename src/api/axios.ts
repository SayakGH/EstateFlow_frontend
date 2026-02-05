import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    //"https://filbk4rekzubnwfov74tvvfwde0rshvr.lambda-url.ap-south-1.on.aws/api/v1" ||
    "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
