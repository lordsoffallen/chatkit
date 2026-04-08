export { meta } from "./meta";
import { getWeather } from "../get-weather";

export const prompt = "";

export function getTools() {
  return { getWeather };
}
