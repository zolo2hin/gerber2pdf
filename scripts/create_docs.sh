#!/bin/bash

sed -e '/MAN/r man.txt' -e '/MAN/d' docs.md > README.md
