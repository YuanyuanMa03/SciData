import { copyFile, mkdir, readFile } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);
const indexFile = new URL("dist/index.html", projectRoot);
const datasetsFile = new URL("public/data/datasets.json", projectRoot);

const datasets = JSON.parse(await readFile(datasetsFile, "utf8"));
const staticRoutes = [
  "explore",
  "disciplines",
  "collections",
  "about",
  "404",
  ...datasets.map(({ id }) => `dataset/${id}`),
];

await copyFile(
  indexFile,
  new URL("dist/404.html", projectRoot),
);

await Promise.all(
  staticRoutes.map(async (route) => {
    const routeDirectory = new URL(`dist/${route}/`, projectRoot);
    await mkdir(routeDirectory, { recursive: true });
    await copyFile(indexFile, new URL("index.html", routeDirectory));
  }),
);
