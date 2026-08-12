import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://echoesvault-9awqy2br.manus.space";

// Simple API client that talks to the web app's tRPC endpoints via fetch
export class EchoesApi {
  private sessionCookie: string | null = null;

  async getSessionCookie(): Promise<string | null> {
    if (!this.sessionCookie) {
      this.sessionCookie = await AsyncStorage.getItem("echoes_session");
    }
    return this.sessionCookie;
  }

  async setSessionCookie(cookie: string) {
    this.sessionCookie = cookie;
    await AsyncStorage.setItem("echoes_session", cookie);
  }

  async clearSession() {
    this.sessionCookie = null;
    await AsyncStorage.removeItem("echoes_session");
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.sessionCookie) {
      headers["Cookie"] = this.sessionCookie;
    }
    return headers;
  }

  async login(): Promise<string> {
    // The web app uses Manus OAuth - for the mobile app, we'll use a simple auth flow
    // For testing, we'll create a direct session
    const resp = await fetch(`${BASE_URL}/api/oauth/callback?temp=1`, {
      headers: this.getHeaders(),
    });
    // Get session cookie from response
    const setCookie = resp.headers.get("set-cookie");
    if (setCookie) {
      await this.setSessionCookie(setCookie);
    }
    return setCookie || "";
  }

  // ─── Echoes ───
  async getEchoes(): Promise<any[]> {
    const resp = await fetch(`${BASE_URL}/api/trpc/echoes.list?batch=1&input={"0":{"json":null}}`, {
      headers: this.getHeaders(),
    });
    const data = await resp.json();
    return data[0]?.result?.data?.json || [];
  }

  async getEchoesByMode(mode: string): Promise<any[]> {
    const resp = await fetch(
      `${BASE_URL}/api/trpc/echoes.byMode?batch=1&input={"0":{"json":{"mode":"${mode}"}}}`,
      { headers: this.getHeaders() }
    );
    const data = await resp.json();
    return data[0]?.result?.data?.json || [];
  }

  async uploadRecording(data: {
    audioUri: string;
    audioMime: string;
    mode: string;
    ambience: string;
    durationSec: number;
    title?: string;
    sealDate?: string;
    unlockDate?: string;
  }): Promise<any> {
    // First upload to the file endpoint
    const formData = new FormData();
    const fileName = `echo-${Date.now()}.webm`;
    formData.append("file", {
      uri: data.audioUri,
      name: fileName,
      type: data.audioMime,
    } as any);

    const resp = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
      headers: {
        ...(this.sessionCookie ? { Cookie: this.sessionCookie } : {}),
      },
    });

    const result = await resp.json();
    if (!result.url) {
      throw new Error("Upload failed");
    }

    // Then save the echo via tRPC
    const input = JSON.stringify({
      json: {
        audioUrl: result.url,
        audioKey: result.key,
        mode: data.mode,
        ambience: data.ambience,
        durationSec: data.durationSec,
        title: data.title || null,
        sealDate: data.sealDate || null,
        unlockDate: data.unlockDate || null,
      },
    });

    const saveResp = await fetch(
      `${BASE_URL}/api/trpc/echoes.create?batch=1&input={"0":${input}}`,
      {
        method: "POST",
        headers: this.getHeaders(),
      }
    );

    const saveData = await saveResp.json();
    return saveData[0]?.result?.data?.json || saveData[0];
  }

  async getCollections(): Promise<any[]> {
    const resp = await fetch(`${BASE_URL}/api/trpc/collections.list?batch=1&input={"0":{"json":null}}`, {
      headers: this.getHeaders(),
    });
    const data = await resp.json();
    return data[0]?.result?.data?.json || [];
  }

  async getInsights(): Promise<any[]> {
    const resp = await fetch(`${BASE_URL}/api/trpc/insights.list?batch=1&input={"0":{"json":null}}`, {
      headers: this.getHeaders(),
    });
    const data = await resp.json();
    return data[0]?.result?.data?.json || [];
  }

  async exportArchive(): Promise<any> {
    const resp = await fetch(`${BASE_URL}/api/trpc/archive.export?batch=1&input={"0":{"json":null}}`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await resp.json();
    return data[0]?.result?.data?.json || null;
  }

  async deleteEcho(id: number): Promise<void> {
    const resp = await fetch(
      `${BASE_URL}/api/trpc/echoes.delete?batch=1&input={"0":{"json":{"id":${id}}}}`,
      {
        method: "POST",
        headers: this.getHeaders(),
      }
    );
    await resp.json();
  }
}

export const api = new EchoesApi();
