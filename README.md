# Gerber pdf util

Crude script which takes gerber files from Autodesk Eagle and converts them to pdf with negative circuits for UV dry film printing

Main reason for this project is lack of quality negative export from eagle which is also proportional with real-world size.


# Usage

```bash
# setup
# 1. Clone repo and move to project dir
$ yarn && yarn build
$ yarn link

# Move to your working directory with gerbers
$ gerber-to-pdf bottom.gbr top.gbr
# This creates output.pdf file with negatives in current dir

# If you also want to add drill holes
$ gerber-to-pdf bottom.gbr top.gbr -d drill.xln
```
# Example output


# Supported Options


