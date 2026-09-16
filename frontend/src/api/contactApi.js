import api from "./api";

export const sendContactMessage = (messageData) =>
  api.post("/contact", messageData);