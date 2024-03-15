#*****************
# OSFLAG
# https://gist.github.com/sighingnow/deee806603ec9274fd47
#*****************

OSFLAG 				:=

ifeq ($(OS),Windows_NT)
	OSFLAG += -D WIN32
	ifeq ($(PROCESSOR_ARCHITECTURE),AMD64)
		OSFLAG += -D AMD64
	endif
	ifeq ($(PROCESSOR_ARCHITECTURE),x86)
		OSFLAG += -D IA32
	endif
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		OSFLAG += -D LINUX
	endif
	ifeq ($(UNAME_S),Darwin)
		OSFLAG += -D OSX
	endif
		UNAME_P := $(shell uname -p)
	ifeq ($(UNAME_P),x86_64)
		OSFLAG += -D AMD64
	endif
		ifneq ($(filter %86,$(UNAME_P)),)
	OSFLAG += -D IA32
		endif
	ifneq ($(filter arm%,$(UNAME_P)),)
		OSFLAG += -D ARM
	endif
endif

#*****************
# Misc
#*****************

# https://makefiletutorial.com
SHELL=/bin/bash

workspaceFolder :=
gradlewScript :=

ifneq ($(OS),Windows_NT)
	workspaceFolder = ./
	gradlewScript = gradlew
else
	gradlewScript = .\gradlew.bat
endif

#*****************
# Tasks
#*****************

osflag:
	@echo $(OSFLAG)

#*****************
# Code tasks
#*****************

backend:
	@echo -e "\n*********Backend*********\n"
	@echo WIP

cli:
	@echo -e "\n*********CLI*********\n"
	@echo WIP

frontend:
	@echo -e "\n*********Frontend*********\n"
	@echo WIP

#*****************
# Git tasks
#*****************

git-version:
	git --version

git-upgrade-ubuntu:
	sudo apt-get install software-properties-common
	sudo add-apt-repository ppa:git-core/ppa -y
	sudo apt-get update
	sudo apt-get upgrade
	sudo apt-get install git -y
	git --version

git-submodules-setup:
	git submodule sync --recursive
	git submodule foreach --recursive git fetch
	git submodule foreach git pull

git-get-submodules:
	git submodule update --init --recursive --remote --rebase

#*****************
# All tasks
#*****************

git: git-version git-get-submodules

code: backend cli frontend

all: git code
