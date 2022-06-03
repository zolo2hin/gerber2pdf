import { readFile, writeFile } from "../helpers";
import { man } from "./man";

const make = async () => {
  writeFile('README.md', (await readFile('lib/docs/docs.md')).toString().replace('MAN', man));
}

make();
