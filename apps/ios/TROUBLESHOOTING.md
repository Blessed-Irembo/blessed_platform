# Common iOS Build Errors & Solutions

## 🔍 Diagnosing Your Error

To help me fix your specific errors, please tell me:

1. **What error messages do you see in Xcode?**

   - Look in the "Issues" navigator (⌘5)
   - Copy the red error messages

2. **Where are the errors occurring?**
   - Which files are showing errors?
   - What line numbers?

## Common Build Errors & Fixes

### Error: "Cannot find type 'Color' in scope"

**Solution**: Make sure ColorExtension.swift is added to your target

- Select ColorExtension.swift in Project Navigator
- Check "Target Membership" in File Inspector (right panel)
- Ensure "BlessedIrembo" is checked

### Error: "Cannot find '##ColorName' in scope"

**Solution**: Build order issue or missing import

```swift
// Add this at the top of files using custom colors:
import SwiftUI
```

### Error: "Value of type 'Color' has no member 'primaryTeal'"

**Solution**: ColorExtension.swift not compiling

1. Open ColorExtension.swift
2. Press ⌘B to build
3. Check for any errors in that file

### Error: "Cannot find 'Constants' in scope"

**Solution**: Constants.swift not in target

- Select Constants.swift
- File Inspector → Target Membership → Check "BlessedIrembo"

### Error: "Type 'AppState' has no member 'navigationPath'"

**Solution**: iOS version too low

- Select project in navigator
- Under "Deployment Info"
- Set "iOS Deployment Target" to **16.0** or higher

### Error: Missing SF Symbols

**Solution**: Update Icons in Constants.swift

```swift
// If SF Symbol doesn't exist, use alternatives:
"map.fill"       → "map"
"location.fill"  → "location"
"phone.fill"     → "phone"
```

### Error: "Cannot find 'logo1' in asset catalog"

**Solution**: Add logos to Assets

1. Open Assets.xcassets
2. Right-click → New Image Set
3. Name it "logo1"
4. Drag logo1.png into 1x, 2x, and 3x slots
5. Repeat for "logo2"

### Error: Multiple files with same name

**Solution**: Remove duplicate files

- Xcode may have created default files
- Delete: ContentView.swift (Xcode's default)
- Keep only our custom files

---

## 🛠️ Step-by-Step Fix Process

### 1. Clean Build Folder

```
Product → Clean Build Folder (⇧⌘K)
```

### 2. Check All Files Are in Target

For each file in Project Navigator:

- Select file
- File Inspector (⌘⌥1)
- Target Membership → ✓ BlessedIrembo

###3. Verify File Structure

```
BlessedIrembo/
└── BlessedIrembo/
    ├── App/
    ├── Models/
    ├── ViewModels/
    ├── Views/
    ├── Utilities/
    └── Assets.xcassets/
```

### 4. Check Import Statements

Every Swift file should have:

```swift
import SwiftUI
```

Views using models should have:

```swift
import Foundation  // If using Date, etc.
```

### 5. Verify iOS Deployment Target

- Select project (blue icon at top)
- General tab
- Minimum Deployments: **iOS 16.0**

### 6. Build Again

```
⌘B or Product → Build
```

---

## 📱 Quick Test Without Xcode Errors

If you want to test the code logic without Xcode build errors:

### Create a Simple Test View

1. Comment out problem views temporarily
2. Replace in`BlessedIremboApp.swift`:

```swift
var body: some Scene {
    WindowGroup {
        Text("Hello, Blessed Irembo!")
            .font(.largeTitle)
            .foregroundColor(.teal)
    }
}
```

3. Build and run
4. If this works, uncomment views one by one to find the problem

---

## 🆘 If Still Having Issues

**Please provide:**

1. **Screenshot of errors** in Xcode
2. **Copy of error messages** from Issues navigator
3. **Which file** is causing the error
4. **Your iOS deployment target** version
5. **Xcode version** you're using

I can then provide specific fixes for your exact situation!

---

## 💡 Pro Tips

- Press ⌘⌥⌃C to clean derived data (cache)
- Restart Xcode if weird errors persist
- Check file encoding is UTF-8
- Make sure no files have same name in different folders
