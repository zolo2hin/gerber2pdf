import * as fs from 'fs';
import { promisify } from 'util';
import * as GerberToSvg from 'gerber-to-svg';
import { SvgItem } from "./entities/SvgItem";

export const readDir = fs.promises.readdir;
export const readFile = promisify(fs.readFile);
export const writeFile = fs.promises.writeFile;

export const Converter = (code: string, options: Record<string, unknown> = {}): Promise<GerberToSvg.Converter> => {
  return new Promise((resolve) => {
    let self: GerberToSvg.Converter = GerberToSvg(code, options, () => resolve(self));
  });
};

export const getSvg = async (file: string, options: Record<string, unknown> = {}): Promise<SvgItem> => {
  const svg: SvgItem = {
    width: 0,
    height: 0,
    content: null,
  };


  // @ts-ignore
  options.attributes['transform'] = 'translate(0,0) scale(1,1)';

  const converter = await Converter(await readFile(file, 'utf-8'), options);

  converter.on('error', e => console.log('error:', e));
  converter.on('warning', e => console.log('warning:', e));

  let content = GerberToSvg.render(converter, 'id');

  // @ts-ignore
  content = content.replace(/<g([^>]+)fill="\w+"/s, `<g$1fill="${options.attributes.color}"`);
  // @ts-ignore
  content = content.replace(/<g([^>]+)stroke="\w+"/s, `<g$1stroke="${options.attributes.color}"`);

  if (options.flip) {
    const att = `scale(-1, -1) translate(-${converter.viewBox[2] + converter.viewBox[0]*2}, ${Math.abs(converter.viewBox[3] + converter.viewBox[1]*2)})`;
    await writeFile('test.svg', content);
    content = content.replace(/<g([^>]+)transform="[\w\d\-()\s,.]+"/s, `<g$1transform="${att}"`);
    await writeFile('test2.svg', content);
  }

  svg.content = content;

  const sizeMult = converter.units == 'mm' ? 1 : 25.4;
  svg.width = converter.width*sizeMult;
  svg.height = converter.height*sizeMult;

  return svg;
};
