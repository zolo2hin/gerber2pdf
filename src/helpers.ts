import * as fs from 'fs';
import { promisify } from 'util';
import * as GerberToSvg from 'gerber-to-svg';
import { JSDOM } from 'jsdom';
import { SvgItem } from "./entities/SvgItem";

export const readDir = fs.promises.readdir;
export const readFile = promisify(fs.readFile);

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

  const dom = new JSDOM(GerberToSvg.render(converter, 'id'));
  // @ts-ignore
  dom.window.document.querySelector('svg > g').setAttribute('fill', options.attributes.color);
  // @ts-ignore
  dom.window.document.querySelector('svg > g').setAttribute('stroke', options.attributes.color);

  if (options.flip) {
    dom.window.document.querySelector('svg > g').setAttribute('transform', `scale(-1, -1) translate(-${converter.viewBox[2] + converter.viewBox[0]*2}, ${Math.abs(converter.viewBox[3] + converter.viewBox[1]*2)})`);
  }

  svg.content = dom.window.document.querySelector('body').innerHTML;

  const sizeMult = converter.units == 'mm' ? 1 : 25.4;
  svg.width = converter.width*sizeMult;
  svg.height = converter.height*sizeMult;

  return svg;
};
