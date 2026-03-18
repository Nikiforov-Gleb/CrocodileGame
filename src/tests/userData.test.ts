import { UserData } from "../base/userData.ts";

describe("userData", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("should empty if nickname not save in localStorage", () => {
    expect(UserData.nickname).toBe("");
  });

  it("should save in localStorage", () => {
    const nickname = "Ivan";
    UserData.setNickname(nickname);
    expect(localStorage.getItem("nickname")).toBe(nickname);
  });

  it("should read from localStorage", async () => {
    const nickname = "Cloud";
    localStorage.setItem("nickname", nickname);

    const { UserData } = await import("../base/userData.ts");
    expect(UserData.nickname).toBe(nickname);
  });
});
