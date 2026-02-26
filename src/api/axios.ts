import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://bfsxhkicynzuzqv6bv2cfosuoq0havve.lambda-url.ap-south-1.on.aws/api/v1",
  // "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
