import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../config/server";
import { DEFAULT_MODELS, OPENAI_BASE_URL } from "../constant";
import { collectModelTable, collectModels } from "../utils/model";

const serverConfig = getServerSideConfig();

export async function requestOpenai(req: NextRequest) {
  const controller = new AbortController();
  const authValue = req.headers.get("Authorization") ?? "";
  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl = serverConfig.baseUrl ?? OPENAI_BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);
  console.log("[Org ID]", serverConfig.openaiOrgId);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  let fetchUrl = `${baseUrl}/${openaiPath}`;
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Authorization: authValue,
      ...(process.env.OPENAI_ORG_ID && {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID,
      }),
    },
    method: req.method,
    body: req.body,
    // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
  if (!!AZURE_ENDPOINT) {
    const AZURE_API_KEY = process.env.AZURE_API_KEY;
    const AZURE_DEPLOY_NAME = process.env.AZURE_DEPLOY_NAME;
    const AZURE_API_VERSION = process.env.AZURE_API_VERSION || "2023-05-15";

    if (!!AZURE_API_KEY && !!AZURE_DEPLOY_NAME) {
      const AZURE_REQUEST_PATH = `openai/deployments/${AZURE_DEPLOY_NAME}/chat/completions?api-version=${AZURE_API_VERSION}`;

      fetchUrl = `${AZURE_ENDPOINT}/${AZURE_REQUEST_PATH}`;

      if (!fetchUrl.startsWith("http")) {
        fetchUrl = `${PROTOCOL}://${fetchUrl}`;
      }

      fetchOptions.headers = {
        ...fetchOptions.headers,
        "api-key": AZURE_API_KEY,
      };

      console.log("[Azure Fetch Url] ", fetchUrl);
    }
  }

  // #1815 try to refuse gpt4 request
  if (serverConfig.customModels && req.body) {
    try {
      const modelTable = collectModelTable(
        DEFAULT_MODELS,
        serverConfig.customModels,
      );
      const clonedBody = await req.text();
      fetchOptions.body = clonedBody;

      const jsonBody = JSON.parse(clonedBody) as { model?: string };

      // not undefined and is false
      if (modelTable[jsonBody?.model ?? ""] === false) {
        return NextResponse.json(
          {
            error: true,
            message: `you are not allowed to use ${jsonBody?.model} model`,
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      console.error("[OpenAI] gpt4 filter", e);
    }
  }

  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
