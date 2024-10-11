import axios from "axios";

export const checkMarshmallow = async (
  screenshot: string | null | undefined
) => {
  if (!screenshot) {
    throw new Error("Screenshot is null or undefined.");
  }

  const res = await axios.post("/api/check_marshmallow", {
    snapshot: screenshot,
  });

  return res.data;
};
