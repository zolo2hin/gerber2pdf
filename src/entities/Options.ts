import { PcbMode } from "../@types/pcbMode";

export class Options {
  src: string;
  outputDir: string;
  outputFileName: string;
  pcbMode: PcbMode;
  copy?: number;
  sizeCorrection?: number;
  useDrill?: boolean;
  useMask?: boolean;
  useSilk?: boolean;
  drillCorrectionTop?: {
    x: number;
    y: number;
  };
  drillCorrectionBottom?: {
    x: number;
    y: number;
  };
  padding?: number;
  borders?: number;
  flip?: boolean;
  annotatePage: boolean;
  annotateLayers: boolean;
  outputExtra: boolean;
}
