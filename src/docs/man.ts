export const man = `

  FORMAT:

  gerber2pdf /gerbers/dir [/output/dir] [OPTIONS]

  OPTIONS:

  --help  , -h  Show help
  --option, -o  Override default option. 
  
                Format:
                option=value
  
                Supported options:
                outputFileName        - output file basename; default: 'print'
                pcbMode               - ttm | photo ; affects inversion of copper and silk layers; default: photo 
                copy                  - layers duplication; default: 1
                sizeCorrection        - size multiplier; default: 1.00
                drillCorrectionTop    - correction of top drill layer position; default: {"x": 0.00, "y": 0.00}
                drillCorrectionBottom - correction of bottom drill layer position; default: {"x": 0.00, "y": 0.00}
                useDrill              - should drills layer be added to the copper layers; default: true
                useSilk               - add silk layers; default: true
                useMask               - add mask layers; default: true
                flip                  - should top layer be flipped horizontally; default: true
                annotatePage          - adds some PCB information and util settings to the output page; default: true
                outputExtra           - adds suffiks to the output file name with extra information; default: true
                padding               - space between layers; default: 0
                borders               - distance from the sheet borders; default: 20
  
  --debug,  -d Toggle debug mode
  `;
