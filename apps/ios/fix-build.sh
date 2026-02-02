#!/bin/bash

# iOS Build Fix Script
# Automatically fixes common build issues in the Blessed Irembo iOS app

echo "🔧 Blessed Irembo iOS Build Fix Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")/BlessedIrembo"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if we're in the right directory
if [ ! -f "BlessedIrembo.xcodeproj/project.pbxproj" ]; then
    echo "${RED}❌ Error: Not in BlessedIrembo directory${NC}"
    exit 1
fi

echo "✅ Found Xcode project"
echo ""

# 1. Check for logo files
echo "🖼️  Checking logo assets..."
if [ -f "BlessedIrembo/Assets.xcassets/logo1.imageset/logo1.png" ]; then
    echo "${GREEN}✅ logo1.png found${NC}"
else
    echo "${YELLOW}📌 Copying logo1.png...${NC}"
    mkdir -p BlessedIrembo/Assets.xcassets/logo1.imageset/
    cp ../../web/blessed_irembo_web/public/logo1.png BlessedIrembo/Assets.xcassets/logo1.imageset/
    cp BlessedIrembo/Assets.xcassets/logo1.imageset/logo1.png BlessedIrembo/Assets.xcassets/logo1.imageset/logo1@2x.png
    cp BlessedIrembo/Assets.xcassets/logo1.imageset/logo1.png BlessedIrembo/Assets.xcassets/logo1.imageset/logo1@3x.png
    echo "${GREEN}✅ logo1 added${NC}"
fi

if [ -f "BlessedIrembo/Assets.xcassets/logo2.imageset/logo2.png" ]; then
    echo "${GREEN}✅ logo2.png found${NC}"
else
    echo "${YELLOW}📌 Copying logo2.png...${NC}"
    mkdir -p BlessedIrembo/Assets.xcassets/logo2.imageset/
    cp ../../web/blessed_irembo_web/public/logo2.png BlessedIrembo/Assets.xcassets/logo2.imageset/
    cp BlessedIrembo/Assets.xcassets/logo2.imageset/logo2.png BlessedIrembo/Assets.xcassets/logo2.imageset/logo2@2x.png
    cp BlessedIrembo/Assets.xcassets/logo2.imageset/logo2.png BlessedIrembo/Assets.xcassets/logo2.imageset/logo2@3x.png
    echo "${GREEN}✅ logo2 added${NC}"
fi

echo ""

# 2. Check Swift files
echo "📄 Checking Swift files..."
SWIFT_COUNT=$(find BlessedIrembo -name "*.swift" | wc -l | tr -d ' ')
echo "Found $SWIFT_COUNT Swift files"

if [ "$SWIFT_COUNT" -lt "15" ]; then
    echo "${YELLOW}⚠️  Expected at least 15 Swift files${NC}"
else
    echo "${GREEN}✅ All Swift files present${NC}"
fi

echo ""

# 3. Clean build folder
echo "🧹 Cleaning build folder..."
xcodebuild -project BlessedIrembo.xcodeproj -scheme BlessedIrembo clean > /dev/null 2>&1
echo "${GREEN}✅ Build folder cleaned${NC}"
echo ""

# 4. Try to build
echo "🔨 Attempting to build project..."
echo "This may take a moment..."
echo ""

BUILD_LOG=$(mktemp)
xcodebuild -project BlessedIrembo.xcodeproj -scheme BlessedIrembo -sdk iphonesimulator build 2>&1 | tee "$BUILD_LOG"

# Check build result
if grep -q "BUILD SUCCEEDED" "$BUILD_LOG"; then
    echo ""
    echo "${GREEN}✅✅✅ BUILD SUCCESSFUL! ✅✅✅${NC}"
    echo ""
    echo "🎉 Your iOS app is ready to run!"
    echo "   Open BlessedIrembo.xcodeproj in Xcode and press ⌘R"
    rm "$BUILD_LOG"
    exit 0
else
    echo ""
    echo "${YELLOW}⚠️  Build had issues. Checking errors...${NC}"
    echo ""
    
    # Show errors
    if grep -q "error:" "$BUILD_LOG"; then
        echo "${RED}Errors found:${NC}"
        grep "error:" "$BUILD_LOG" | head -10
        echo ""
        echo "💡 Common fixes:"
        echo "   1. Open Xcode → Product → Clean Build Folder (⇧⌘K)"
        echo "   2. Check deployment target is iOS 16.0+"
        echo "   3. Ensure all files are in target"
        echo "   4. See TROUBLESHOOTING.md for detailed help"
    else
        echo "${YELLOW}No explicit errors found, but build didn't succeed${NC}"
        echo "Try opening in Xcode for more details"
    fi
    
    rm "$BUILD_LOG"
    exit 1
fi
