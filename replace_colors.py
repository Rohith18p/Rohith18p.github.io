import re

with open('/Users/rohith/My/WORK/Website/Rohith18p.github.io/css/styles.css', 'r') as f:
    content = f.read()

replacements = {
    '#0a192f': '#121212',
    '#020c1b': '#050505',
    '#112240': '#1a1a1a',
    '#00d9ff': '#ffffff',
    '#a855f7': '#888888',
    '#00ff88': '#cccccc',
    'rgba(0, 217, 255': 'rgba(255, 255, 255',
    'rgba(168, 85, 247': 'rgba(136, 136, 136',
    'rgba(10, 25, 47': 'rgba(18, 18, 18',
    'rgba(17, 34, 64': 'rgba(26, 26, 26',
    'rgba(2, 12, 27': 'rgba(5, 5, 5',
    '#1a2a4f': '#181818',
    '#2a1a4f': '#222222',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('/Users/rohith/My/WORK/Website/Rohith18p.github.io/css/styles.css', 'w') as f:
    f.write(content)

print("Replacement complete.")
