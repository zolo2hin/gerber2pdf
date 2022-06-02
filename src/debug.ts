import * as fs from 'fs';
import * as GerberToSvg from 'gerber-to-svg';
import * as GerberParser from 'gerber-parser';
import * as GerberPlotter from 'gerber-plotter';
import * as pump from 'pump';

export const gerberParseToFile = async (gerberFile: string, output: string) => {
  const parser = GerberParser({});
  fs.writeFile(output, '', _ => {});
  fs.createReadStream(gerberFile)
    .pipe(parser)
    .on('data', function (obj) {
      fs.writeFile(output, JSON.stringify(obj), { flag: 'a+' }, err => {
        if (err) {
          console.error(err);
        }
      });
    });
};

export const gerberPlotToFile = async (gerberFile: string, output: string) => {
  const parser = GerberParser({});
  const plotter = GerberPlotter({});

  plotter.on('warning', function (w) {
    console.warn('plotter warning at line ' + w.line + ': ' + w.message);
  });

  plotter.once('error', function (e) {
    console.error('plotter error: ' + e.message);
  });

  fs.writeFile(output, '', _ => {});
  fs.createReadStream(gerberFile)
    .pipe(parser)
    .pipe(plotter)
    .on('data', function (obj) {
      fs.writeFile(output, JSON.stringify(obj), { flag: 'a+' }, err => {
        if (err) {
          console.error(err);
        }
      });
    });
};

export const gerberToSvgFile = async (gerberFile: string, outputSvg: string) => {
  pump(
    GerberToSvg(fs.createReadStream(gerberFile)),
    fs.createWriteStream(outputSvg),
    error => {
      if (error) return console.error(`Error rendering ${name}`, error);
      console.log(`Wrote: ${outputSvg}`);
    }
  );
};
