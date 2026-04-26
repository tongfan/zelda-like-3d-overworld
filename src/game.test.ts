import { beforeEach, describe, expect, it, vi } from "vitest";

const rendererDispose = vi.fn();
const rendererRender = vi.fn();
const rendererSetPixelRatio = vi.fn();
const rendererSetSize = vi.fn();
const canvas = {
  tagName: "CANVAS",
  parentElement: null as HTMLElement | null
};

vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");

  class WebGLRenderer {
    domElement = canvas;
    shadowMap = { enabled: false };

    setPixelRatio = rendererSetPixelRatio;
    setSize = rendererSetSize;
    render = rendererRender;
    dispose = rendererDispose;
  }

  return { ...actual, WebGLRenderer };
});

const inputDispose = vi.fn();
vi.mock("./input", () => ({
  InputController: vi.fn().mockImplementation(() => ({
    dispose: inputDispose,
    endFrame: vi.fn(),
    consumeInteract: vi.fn(() => false),
    consumeAttack: vi.fn(() => false),
    moveX: 0,
    moveZ: 0,
    jumpHeld: false,
    pointerDeltaX: 0,
    pointerDeltaY: 0
  }))
}));

const hudDispose = vi.fn();
vi.mock("./hud", () => ({
  HUD: vi.fn().mockImplementation(() => ({
    setPrompt: vi.fn(),
    render: vi.fn(),
    dispose: hudDispose
  }))
}));

import { Game } from "./game";

describe("Game", () => {
  const requestAnimationFrame = vi.fn(() => 42);
  const cancelAnimationFrame = vi.fn();
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    canvas.parentElement = null;
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
      requestAnimationFrame,
      cancelAnimationFrame,
      devicePixelRatio: 2,
      innerWidth: 1024,
      innerHeight: 768
    });
  });

  function root(): HTMLElement {
    const root = {
      clientWidth: 800,
      clientHeight: 600,
      appendChild: vi.fn((child: typeof canvas) => {
        child.parentElement = root as unknown as HTMLElement;
        return child;
      }),
      removeChild: vi.fn((child: typeof canvas) => {
        child.parentElement = null;
        return child;
      })
    };

    return root as unknown as HTMLElement;
  }

  it("appends one renderer canvas during construction", () => {
    const gameRoot = root();
    const hudRoot = {};

    new Game(gameRoot, hudRoot as unknown as HTMLElement);

    expect(gameRoot.appendChild).toHaveBeenCalledOnce();
    expect(gameRoot.appendChild).toHaveBeenCalledWith(expect.objectContaining({ tagName: "CANVAS" }));
    expect(rendererSetPixelRatio).toHaveBeenCalledWith(2);
    expect(rendererSetSize).toHaveBeenCalledWith(800, 600, false);
  });

  it("starts at most one RAF loop", () => {
    const game = new Game(root(), {} as HTMLElement);

    game.start();
    game.start();

    expect(requestAnimationFrame).toHaveBeenCalledOnce();
  });

  it("disposes browser resources, owned DOM, and lifecycle state idempotently", () => {
    const gameRoot = root();
    const game = new Game(gameRoot, {} as HTMLElement);

    game.start();
    game.dispose();
    game.dispose();

    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    expect(removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(inputDispose).toHaveBeenCalledOnce();
    expect(rendererDispose).toHaveBeenCalledOnce();
    expect(hudDispose).toHaveBeenCalledOnce();
    expect(gameRoot.removeChild).toHaveBeenCalledOnce();
    expect(canvas.parentElement).toBeNull();
  });

  it("does not start after disposal", () => {
    const game = new Game(root(), {} as HTMLElement);

    game.dispose();
    game.start();

    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
