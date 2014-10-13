REPORTER ?= spec
TESTS = $(shell find ./test/* -name "*.test.js")

# test commands

test:
	@if [ "$$GREP" ]; then \
		./node_modules/mocha/bin/mocha --check-leaks --colors -t 10000 --reporter $(REPORTER) -g "$$GREP" $(TESTS); \
	else \
		./node_modules/mocha/bin/mocha --check-leaks --colors -t 10000 --reporter $(REPORTER) $(TESTS); \
	fi
