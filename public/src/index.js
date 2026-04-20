import { initProjects } from "./projects.js";
import { initEffects } from "./effects.js";
import { initModel } from "./model.js";

initModel();
initProjects().then(initEffects);
