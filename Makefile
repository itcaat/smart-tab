EXT_NAME=smart-tab
EXT_VERSION=1.0.2
DIST_DIR=dist
ZIP_FILE=$(EXT_NAME)-$(EXT_VERSION).zip

SRC_FILES=manifest.json newtab.html newtab.js newtab.css icon16.png icon48.png icon128.png

.PHONY: all clean dist

all: dist

dist: clean
	@echo "Preparing extension package..."
	@mkdir -p $(DIST_DIR)
	@cp $(SRC_FILES) $(DIST_DIR)/
	@cd $(DIST_DIR) && zip -r ../$(ZIP_FILE) *

clean:
	@rm -rf $(DIST_DIR) $(ZIP_FILE)
	@echo "Cleaned up build artifacts." 