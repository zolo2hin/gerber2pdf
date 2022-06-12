import * as path from 'path';
import {GerbersLib} from "./entities/GerbersLib";
import {Options} from "./entities/Options";
import {
    bColor,
    copperLayers, defaultOptions,
    fColor,
    matchers, optionDefinitions,
    pdfHeight,
    pdfMult,
    pdfWidth
} from "./rules";
import {getSvg, readDir, readFile} from "./helpers";
import {PdfWriter} from "./entities/PdfWriter";
import {man} from "./docs/man";
import {plainToClassFromExist} from 'class-transformer'

const args = require('command-line-args')(optionDefinitions);
let debugMode = 0;

const retrieveOptions = async (): Promise<Options> => {
    const options = defaultOptions;
    console.log(args);

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
            const k = optionRedefine[0];
            let v = optionRedefine[1];

            if (debugMode == 2) {
                console.info('Input option parse: ', k, v);
            }

            if (v && (v.includes('{') || v.includes('['))) {
                const item = plainToClassFromExist(Options, {
                    [k]: JSON.parse(v)
                });
                // @ts-ignore
                options[k] = item[k];
            } else if (parseInt(v).toString() === v) {
                // @ts-ignore
                options[k] = parseInt(v);
            } else if (parseFloat(v)) {
                // @ts-ignore
                options[k] = parseFloat(v);
            } else {
                // @ts-ignore
                options[k] = v;
            }
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

    let offsetLeft: number = options.padding;
    let offsetTop: number = options.annotatePage ? (options.padding * 2 + 7) : options.padding;
    let newLineOffset: number = options.padding;

    const copies = Array.from({length: options.copy}).fill(0);
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
                const isMask = ['topMask', 'bottomMask'].includes(k);
                const isNegativeMask = ['topMaskNegative', 'bottomMaskNegative'].includes(k);
                const isDrilled = isCopper && gerbers.drill;
                const isTop = k.indexOf('top') === 0;
                const isBottom = k.indexOf('bottom') === 0;
                const isModeApplicable = ((isCopper || isSilk) && options.pcbMode == 'photo' && !isNegativeMask);
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

                const realWidth: number = svg.width * pdfMult;
                const realHeight: number = svg.height * pdfMult;

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

                // Drill
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

                    if (debugMode == 2) {
                        console.info('Offset:', offsetLeft, offsetTop);
                        console.info('Drill correction:', drillCorrection);
                        console.info('Drill offset:', drillOffsetLeft, drillOffsetTop);
                    }

                    pdf.printSvg(drillSvg.content,
                        offsetLeft + parseFloat(drillOffsetLeft.toString()) + drillCorrection.x * (isFlipped ? -1.0 : 1.0),
                        offsetTop + parseFloat(drillOffsetTop.toString()) + drillCorrection.y,
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
        console.info('Convertion settings:')
        console.log(options);
    }

    const gerbers: GerbersLib = await defineGerbers(options.src, matchers);
    await toSinglePdf(gerbers, options);
};

const showMan = async () => {
    console.log(man);
};

convert();
