import { Game } from "./game";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#game-root");
const hud = document.querySelector<HTMLDivElement>("#hud");

if (!root || !hud) {
  throw new Error("Missing game root or HUD element");
}

const game = new Game(root, hud);
game.start();

window.addEventListener("beforeunload", () => game.dispose());
