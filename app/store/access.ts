import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_API_HOST, StoreKey } from "../constant";
import { getHeaders } from "../client/api";
import { BOT_HELLO } from "./chat";
import { getClientConfig } from "../config/client";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  enableAOAI: boolean;
  azureEndpoint: string;
  azureDeployName: string;
  aoaiToken: string;

  needCode: boolean;
  hideUserApiKey: boolean;
  openaiUrl: string;
  hideBalanceQuery: boolean;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  switchAOAI: (_: boolean) => void;
  updateAzureEndpoint: (_: string) => void;
  updateAzureDeployName: (_: string) => void;
  updateAOAIToken: (_: string) => void;
  updateOpenAiUrl: (_: string) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
  fetch: () => void;
}

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",

      enableAOAI: false as boolean,
      azureEndpoint: "",
      azureDeployName: "",
      aoaiToken: "",

      needCode: true,
      hideUserApiKey: false,
      openaiUrl: DEFAULT_OPENAI_URL,
      hideBalanceQuery: false,

      enabledAccessControl() {
        get().fetch();

        return get().needCode;
      },
      updateCode(code: string) {
        set(() => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set(() => ({ token }));
      },

      switchAOAI(switchStatus: boolean) {
        set((state) => ({ enableAOAI: switchStatus }));
      },
      updateAzureEndpoint(azureEndpoint: string) {
        set((state) => ({ azureEndpoint }));
      },
      updateAzureDeployName(azureDeployName: string) {
        set((state) => ({ azureDeployName }));
      },
      updateAOAIToken(aoaiToken: string) {
        set(() => ({ aoaiToken }));
      },

      updateOpenAiUrl(url: string) {
        set(() => ({ openaiUrl: url }));
      },
      isAuthorized() {
        get().fetch();

        // has token or has code or disabled access control
        if (get().enableAOAI) {
          return (
            !!get().azureEndpoint &&
            !!get().azureDeployName &&
            !!get().aoaiToken
          );
        }

        return (
          !!get().token || !!get().accessCode || !get().enabledAccessControl()
        );
      },

      fetch() {
        if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
        fetchState = 1;
        fetch("/api/config", {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        })
          .then((res) => res.json())
          .then((res: DangerConfig) => {
            console.log("[Config] got config from server", res);
            set(() => ({ ...res }));

            if ((res as any).botHello) {
              BOT_HELLO.content = (res as any).botHello;
            }
          })
          .catch(() => {
            console.error("[Config] failed to fetch config");
          })
          .finally(() => {
            fetchState = 2;
          });
      },
    }),
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
