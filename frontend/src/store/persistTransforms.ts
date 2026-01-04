// store/persistTransforms.ts
import { createTransform } from "redux-persist";

export const authTransform = createTransform(
  // inbound: before saving to storage
  (inboundState: any) => {
    return {
      ...inboundState,
      accessToken: null, // 🔥 strip token
    };
  },
  // outbound: when rehydrating
  (outboundState: any) => outboundState,
  { whitelist: ["auth"] }
);
