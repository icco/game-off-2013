SHELL=/bin/bash
TEMPFILE := $(shell mktemp -t level)

all: server

server:
	python -m SimpleHTTPServer

new_map:
	./new_map.sh > $(TEMPFILE)
	mv $(TEMPFILE) maps/
