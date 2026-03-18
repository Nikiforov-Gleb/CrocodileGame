import type { Point } from "../types.ts";
import {
  getNormalizedPointFromReal,
  getRandomWord,
  getRealPointFromNormalized,
} from "../utils.ts";
import { words } from "../words.ts";

describe("utils: getNormalizedPointFromReal", () => {
  it("getNormalizedPointFromReal should return value between 0 and 1", () => {
    const canvas = { width: 800, height: 600 } as HTMLCanvasElement;
    const point: Point = { x: 400, y: 300 };
    const result = getNormalizedPointFromReal(point, canvas);
    expect(result).toEqual({ x: 0.5, y: 0.5 });
  });
  it("getNormalizedPointFromReal should return 0 when canvas 0x0", () => {
    const canvas = { width: 0, height: 0 } as HTMLCanvasElement;
    const point: Point = { x: 400, y: 300 };
    const result = getNormalizedPointFromReal(point, canvas);
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe("utils: getRealPointFromNormalized", () => {
  it("getRealPointFromNormalized should return real points", () => {
    const canvas = { width: 800, height: 600 } as HTMLCanvasElement;
    const point: Point = { x: 0.5, y: 0.5 };
    const result = getRealPointFromNormalized(point, canvas);
    expect(result).toEqual({ x: 400, y: 300 });
  });
});

describe("utils: getRandomWord", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Success response", async () => {
    const word = "hello";
    vi.spyOn(global, "fetch").mockResolvedValue(
      createFetchResponse([word], 200) as Response,
    );

    const result = await getRandomWord();
    expect(result).toBe(word);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://random-word-api.herokuapp.com/word?number=1&diff=1",
    );
  });
  it("if fetch response error, should use word from array (word[0])", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      createFetchResponse(null, 404) as Response,
    );
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await getRandomWord();
    expect(result).toBe(words[0]);
  });
});

function createFetchResponse(data: unknown, status: number) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  };
}
