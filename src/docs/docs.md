# Gerber2pdf 

NodeJS utility for converting Gerber files and joining to the single PDF file.

Can be useful in making PCB`s with the toner transfer method (ttm) or using photoresist film (there is possibility to invert images). 

## Installation

Utility can be installed in several ways:

1. Download the binary file from [releases page](https://github.com/zolo2hin/gerber2pdf/releases)
2. Fetch this repository using _git_
3. Download source codes in zip archive 

## Usage

In case of using binary file it`s just needed to run file from command line with passing required options.

Other ways requires installing Node and compiling an app.

```bash
# Load dependencies and build
$ yarn && yarn build

# Run
$ node bin.js /gerber/dir /output/dit
```

## Result PDF Example

TBC


## Supported Options

```
MAN
```

## Layers Definition

Since there are a lot of Gerber files naming variants there is some predefinition.

By default will be printed the Gerber layers defined through the next file formats:
* Top Copper    - .GTL
* Bottom Copper - .GBL
* Top Mask      - .GTS
* Bottom Mask   - .GBS
* Top Silk      - .GTO
* Bottom Silk   - .GBO
* Drill         - .DRL

This behavior can be extended or changed by modifyinfg the regexp rules in the appropriate file [rules.ts](https://github.com/zolo2hin/gerber2pdf/blob/master/src/rules.ts)
