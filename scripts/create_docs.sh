#!/bin/bash

sed "s/MAN/$(cat man.txt)/g" docs.md > README.md
