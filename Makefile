SHELL=/bin/bash
TEMPFILE := $(shell mktemp -t level)

all: local

local:
	python -m SimpleHTTPServer

new_map:
	./new_map.sh > $(TEMPFILE)
	mv $(TEMPFILE) maps/
