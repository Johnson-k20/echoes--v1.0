import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./index";

describe("Echoes learning API scaffold", () => {
  it("reports that the API is intentionally a learning scaffold", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: "learning-scaffold" },
    });
  });

  it("keeps the preserved UI reachable with a clearly marked development identity", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        id: "dev-user-echoes",
        email: "developer@local.echoes",
      },
    });
  });

  it("returns a documented unfinished response instead of accidental backend behavior", async () => {
    const response = await request(app).get("/api/journal-entries");

    expect(response.status).toBe(501);
    expect(response.body).toMatchObject({
      success: false,
      code: "NOT_IMPLEMENTED",
    });
    expect(response.body.message).toContain("BACKEND_ROADMAP.md");
  });
});
