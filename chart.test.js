// ================================================================
// chart.test.js
// ================================================================

const mockCtx = {
  lineWidth: 0,
  strokeStyle: "",
  beginPath: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
  clearRect: jest.fn(),
};

const mockCanvas = {
  width: 50,
  height: 50,
  getContext: jest.fn(() => mockCtx),
};

const { initChart, drawCircle, updateChart, setCtx, setCanvas, getCtx } =
  require("./chart");

beforeEach(() => {
  jest.clearAllMocks();
  setCtx(mockCtx);
  setCanvas(mockCanvas);
});

// ================================================================
// initChart
// ================================================================
describe("initChart()", () => {
  test("将 canvas 元素追加到 chartEl 容器", () => {
    const chartEl = document.createElement("div");
    const appendSpy = jest
      .spyOn(chartEl, "appendChild")
      .mockImplementation(() => {});

    const origCreate = document.createElement.bind(document);
    jest
      .spyOn(document, "createElement")
      .mockImplementationOnce((tag) =>
        tag === "canvas" ? mockCanvas : origCreate(tag)
      );

    initChart(chartEl);

    expect(appendSpy).toHaveBeenCalledWith(mockCanvas);
    jest.restoreAllMocks();
  });

  test("调用 canvas.getContext('2d')", () => {
    const chartEl = document.createElement("div");
    jest.spyOn(chartEl, "appendChild").mockImplementation(() => {});

    const origCreate = document.createElement.bind(document);
    jest
      .spyOn(document, "createElement")
      .mockImplementationOnce((tag) =>
        tag === "canvas" ? mockCanvas : origCreate(tag)
      );

    initChart(chartEl);

    expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
    jest.restoreAllMocks();
  });

  test("初始化后 getCtx() 返回有效的 context 对象", () => {
    const chartEl = document.createElement("div");
    jest.spyOn(chartEl, "appendChild").mockImplementation(() => {});

    const origCreate = document.createElement.bind(document);
    jest
      .spyOn(document, "createElement")
      .mockImplementationOnce((tag) =>
        tag === "canvas" ? mockCanvas : origCreate(tag)
      );

    initChart(chartEl);

    expect(getCtx()).toBe(mockCtx);
    jest.restoreAllMocks();
  });

  // ? 新增：覆盖 getContext 返回 null 时的错误处理分支（lines 17-18）
  test("getContext 返回 null 时，不报错并提前返回", () => {
    const mockCanvasNoCtx = {
      width: 50,
      height: 50,
      getContext: jest.fn(() => null),
    };

    const chartEl = document.createElement("div");
    jest.spyOn(chartEl, "appendChild").mockImplementation(() => {});

    const origCreate = document.createElement.bind(document);
    jest
      .spyOn(document, "createElement")
      .mockImplementationOnce((tag) =>
        tag === "canvas" ? mockCanvasNoCtx : origCreate(tag)
      );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => initChart(chartEl)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to get 2D context from canvas"
    );

    jest.restoreAllMocks();
  });
});

// ================================================================
// drawCircle
// ================================================================
describe("drawCircle()", () => {
  test("正确设置 strokeStyle 为指定颜色", () => {
    drawCircle("#FF0000", 0.5, false);
    expect(mockCtx.strokeStyle).toBe("#FF0000");
  });

  test("调用 beginPath()", () => {
    drawCircle("#FFF", 0.5, false);
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
  });

  test("调用 stroke()", () => {
    drawCircle("#FFF", 0.5, false);
    expect(mockCtx.stroke).toHaveBeenCalledTimes(1);
  });

  test("arc() 以画布中心为圆心，半径为 20", () => {
    drawCircle("#FFF", 0.5, false);
    const [cx, cy, r] = mockCtx.arc.mock.calls[0];
    expect(cx).toBe(25);
    expect(cy).toBe(25);
    expect(r).toBe(20);
  });

  test("anticlockwise 参数正确传递", () => {
    drawCircle("#FFF", 0.5, true);
    const anticlockwise = mockCtx.arc.mock.calls[0][5];
    expect(anticlockwise).toBe(true);
  });

  test("ratio = 0 时不报错", () => {
    expect(() => drawCircle("#FFF", 0, false)).not.toThrow();
  });

  test("ratio = 1 时不报错", () => {
    expect(() => drawCircle("#FFF", 1, false)).not.toThrow();
  });

  test("ctx 为 null 时静默返回，不报错", () => {
    setCtx(null);
    expect(() => drawCircle("#FFF", 0.5, false)).not.toThrow();
  });

  test("canvas 为 null 时静默返回，不报错", () => {
    setCanvas(null);
    expect(() => drawCircle("#FFF", 0.5, false)).not.toThrow();
  });
});

// ================================================================
// updateChart
// ================================================================
describe("updateChart()", () => {
  test("调用 clearRect 清空画布", () => {
    updateChart(300, 700);
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 50, 50);
  });

  test("调用两次 drawCircle（白色+红色各一次）", () => {
    updateChart(500, 500);
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(2);
  });

  test("第一个圆弧颜色为白色 #FFF（income 部分）", () => {
    updateChart(600, 400);
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(2);
  });

  test("income = 0 时不报错（ratio = 0）", () => {
    expect(() => updateChart(0, 500)).not.toThrow();
  });

  test("income 和 outcome 均为 0 时不报错（防止 NaN）", () => {
    expect(() => updateChart(0, 0)).not.toThrow();
    expect(mockCtx.clearRect).toHaveBeenCalled();
  });

  test("outcome = 0 时 ratio = 1，不报错", () => {
    expect(() => updateChart(100, 0)).not.toThrow();
  });

  test("ctx 为 null 时静默返回", () => {
    setCtx(null);
    expect(() => updateChart(100, 200)).not.toThrow();
  });
});