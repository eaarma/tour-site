// store/persistTransforms.ts
import { createTransform } from "redux-persist";

type AuthPersistState = {
  accessToken?: string | null;
};

export const authTransform = createTransform<
  AuthPersistState,
  AuthPersistState
>(
  (inboundState) => ({
    ...inboundState,
    accessToken: null,
  }),
  (outboundState) => outboundState,
  { whitelist: ["auth"] },
);
