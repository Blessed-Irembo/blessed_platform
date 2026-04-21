import Foundation

let pattern1 = "^NPC/A\\d{4}$"
let pred1 = NSPredicate(format: "SELF MATCHES %@", pattern1)
print("Pattern 1 (with anchors):", pred1.evaluate(with: "NPC/A1234"))

let pattern2 = "NPC/A\\d{4}"
let pred2 = NSPredicate(format: "SELF MATCHES %@", pattern2)
print("Pattern 2 (without anchors):", pred2.evaluate(with: "NPC/A1234"))
