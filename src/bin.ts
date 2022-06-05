import * as path from 'path';
import { GerbersLib } from "./entities/GerbersLib";
import { Options } from "./entities/Options";
import {
  bColor,
  copperLayers, defaultOptions,
  fColor,
  matchers, optionDefinitions,
  pdfHeight,
  pdfMult,
  pdfWidth
} from "./rules";
import { getSvg, readDir, readFile } from "./helpers";
import { PdfWriter } from "./entities/PdfWriter";
import { man } from "./docs/man";

const args = require('command-line-args')(optionDefinitions);
let debugMode = 0;

const retrieveOptions = async (): Promise<Options> => {
  const options = defaultOptions;

  if (!args['folders'] || !args['folders'].length) {
    throw new Error('You must specify source folder');
  }

  if (args['debug']) {
    debugMode = args['debug'];
  }

  options.src = path.resolve(args['folders'][0]);
  options.outputDir = path.resolve(args['folders'][1] || args['folders'][0]);

  if (args['option'] && args['option'].length) {
    args['option'].forEach((o: string) => {
      const optionRedefine = o.split('=');

      if (optionRedefine[1] && (optionRedefine[1].includes('{') || optionRedefine[1].includes('['))) {
        optionRedefine[1] = JSON.parse(optionRedefine[1]);
      }
      // @ts-ignore
      options[optionRedefine[0]] = optionRedefine[1];
    });
  }

  return options;
};

const defineGerbers = async (folder: string, matchers: Record<keyof GerbersLib, RegExp>): Promise<GerbersLib> => {
  const lib: GerbersLib = {};
  let k: string;

  for (let file of await readDir(folder)) {
    for (k in matchers) {
      if (matchers[k as keyof GerbersLib].test(file)) {
        lib[k as keyof GerbersLib] = path.resolve(folder, file);
      }
    }
  }

  return lib;
};

const generateOutputFileName = (options: Options): string => {
  return `${options.outputFileName}${options.outputExtra ? ('_' + options.pcbMode + '_' + options.sizeCorrection + '_' + Date.now()) : ''}.pdf`;
};

const toSinglePdf = async (gerbers: GerbersLib, options: Options) => {
  const outputFileName = generateOutputFileName(options);
  const pdf = new PdfWriter(
    path.resolve(options.outputDir, outputFileName),
    pdfWidth,
    pdfHeight
  );

  pdf.printOptionsAnotation(options);

  let offsetLeft = options.padding;
  let offsetTop = options.annotatePage ? (options.padding * 2 + 7) : options.padding;
  let newLineOffset = options.padding;

  const copies = Array.from({ length: options.copy }).fill(0);
  for (const i in copies) {
    for (const k in matchers) {

      // Skip non-separate layers
      if (['drill'].includes(k)) {
        continue;
      }

      if (debugMode) {
        console.log(gerbers[k as keyof GerbersLib]);
      }

      try {
        const isCopper = copperLayers.includes(k);
        const isSilk = ['topSilk', 'bottomSilk'].includes(k);
        const isDrilled = isCopper && gerbers.drill;
        const isTop = k.indexOf('top') === 0;
        const isBottom = k.indexOf('bottom') === 0;
        const isModeApplicable = ((isCopper || isSilk) && options.pcbMode == 'photo');
        const isFlipped = options.flip && isTop;
        const gerber = gerbers[k as keyof GerbersLib];

        if (!gerber) {
          continue;
        }

        const svg = await getSvg(gerber, {
          flip: isFlipped,
          attributes: {
            color: isModeApplicable ? fColor : bColor,
          }
        });

        const realWidth = svg.width * pdfMult;
        const realHeight = svg.height * pdfMult;

        if (realWidth > (pdfWidth + options.padding * 2)) {
          // @TODO: try rotate
        }


        // if ((realWidth + offsetLeft + options.padding) > pdfWidth) { // new line
        //   // @TODO: try rotate
        //
        //   console.log('123');
        //   // offsetTop = newLineOffset;
        //
        // } else { // continue current line
        //   pdf.printSvg(svg.content, offsetLeft, offsetTop, realWidth, realHeight);
        //
        //   if (realHeight > newLineOffset) {
        //     newLineOffset = realHeight;
        //   }
        //
        //   offsetLeft += realWidth + options.padding;
        //   // offsetTop += svg.height + options.padding;
        // }

        if ((realWidth + offsetLeft + options.padding) > pdfWidth) { // new line
          offsetLeft = options.padding;
          offsetTop += newLineOffset + options.padding;
        }

        pdf.printSvg(
          svg.content,
          offsetLeft,
          offsetTop,
          realWidth,
          realHeight
        );

        if (isDrilled) {
          const drillSvg = await getSvg(gerbers.drill, {
            flip: isFlipped,
            attributes: {
              color: isModeApplicable ? bColor : fColor,
            }
          });
          const drillRealWidth = drillSvg.width * pdfMult;
          const drillRealHeight = drillSvg.height * pdfMult;
          const drillOffsetLeft = (realWidth - drillRealWidth) / 2.0;
          const drillOffsetTop = (realHeight - drillRealHeight) / 2.0;

          const drillCorrection = isTop ? options.drillCorrectionTop : options.drillCorrectionBottom;

          pdf.printSvg(drillSvg.content,
            offsetLeft + drillOffsetLeft + drillCorrection.x * (isFlipped ? -1.0 : 1.0),
            offsetTop + drillOffsetTop + drillCorrection.y,
            drillRealWidth,
            drillRealHeight,
            false);
        }

        if (realHeight > newLineOffset) {
          newLineOffset = realHeight;
        }

        offsetLeft += realWidth + options.padding;

      } catch (e) {
        console.error(e.message);
      }
    }
  }

  pdf.save();

  console.log(`ok. saved to: ${outputFileName}`)
};

const convert = async () => {
  if (args['help'] !== undefined) {
    await showMan();
    return;
  }

  let options: Options;

  try {
    options = await retrieveOptions();
  } catch (e) {
    console.error(e.message);
    await showMan();
  }

  if (!options) {
    return;
  }

  if (debugMode) {
    console.log(options);
  }

  const gerbers: GerbersLib = await defineGerbers(options.src, matchers);
  await toSinglePdf(gerbers, options);
};

const showMan = async () => {
  console.log(man);
};

convert();
