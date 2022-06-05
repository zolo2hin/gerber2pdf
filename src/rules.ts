import { GerbersLib } from "./entities/GerbersLib";
import { Options } from "./entities/Options";

export const optionDefinitions = [
  { name: 'folders', type: String, multiple: true, defaultOption: true },
  { name: 'option', alias: 'o', type: String, multiple: true, },
  { name: 'include', alias: 'i', type: String, multiple: true },
  { name: 'exclude', alias: 'e', type: String, multiple: true },
  { name: 'help', alias: 'h', type: Number, defaultOption: 0 },
];

export const defaultOptions: Options = {
  src: '',
  outputDir: '',
  outputFileName: 'print',
  pcbMode: 'photo',
  copy: 1,
  sizeCorrection: 1.0,
  drillCorrectionTop: { x: 0.42, y: -0.12 },
  drillCorrectionBottom: { x: 0.42, y: -0.12 },
  padding: 10,
  useDrill: true,
  flip: true,
  annotateLayers: false,
  annotatePage: true,
  outputExtra: true,
};

export const matchers: Record<keyof GerbersLib, RegExp> = {
  topCopper: /\.gtl$/,
  bottomCopper: /\.gbl$/,
  topMask: /\.gts$/,
  bottomMask: /\.gbs$/,
  topSilk: /\.gto$/,
  bottomSilk: /\.gbo$/,
  drill: /\.drl$/,
};

export const copperLayers = ['topCopper', 'bottomCopper'];

export const fColor = '#fff';
export const bColor = '#000';

export const pdfHeight = 842;
export const pdfWidth = 595;
export const pdfMult = pdfWidth / 210.0;
