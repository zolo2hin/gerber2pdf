import * as PDFDocument from 'pdfkit';
import SVGtoPDFkit = require('svg-to-pdfkit');
import { bColor, fColor, pdfHeight, pdfWidth } from "../rules";
import * as fs from 'fs';
import { Options } from "./Options";

export class PdfWriter {
  doc: PDFKit.PDFDocument;

  constructor(output: string, width: number = pdfWidth, height: number = pdfHeight) {
    this.doc = new PDFDocument({ size: [width, height] });
    this.doc.pipe(fs.createWriteStream(output));
  }

  printOptionsAnotation(options: Options) {
    this.doc.fontSize(6);
    this.doc.text(`${options.src}, mode: ${options.pcbMode}, size corr: ${options.sizeCorrection}, drill corr top: x(${options.drillCorrectionTop.x}) y(${options.drillCorrectionTop.y}), drill corr bot: x(${options.drillCorrectionBottom.x}) y(${options.drillCorrectionBottom.y}) flip: ${options.flip}`,
      options.padding,
      options.padding,
    );
  }

  printSvg(content: string, x: number, y: number, width: number, height: number, drawBg = true) {
    if (drawBg) {
      const bg = content.includes(bColor) ? fColor : bColor;
      this.doc
        .rect(x, y, width, height)
        .fill(bg);
    }
    SVGtoPDFkit(this.doc, content, x, y);
  }

  save() {
    this.doc.end();
  }
}
