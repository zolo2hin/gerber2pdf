import { PcbMode } from "../@types/pcbMode";

export class Options {
  src: string;
  outputDir: string;
  outputFileName: string;
  pcbMode: PcbMode;
  copy?: number;
  sizeCorrection?: number;
  useDrill?: boolean;
  drillCorrection?: {
    x: number;
    y: number;
  };
  padding?: number;
  flip?: boolean;
  annotatePage: boolean;
  annotateLayers: boolean;
  outputExtra: boolean;
}
