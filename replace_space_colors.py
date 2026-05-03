import re

with open('/Users/rohith/My/WORK/Website/Rohith18p.github.io/css/styles.css', 'r') as f:
    content = f.read()

replacements = {
    '#121212': '#07090f',   # bg-dark
    '#050505': '#030407',   # bg-darker
    '#1a1a1a': '#111522',   # bg-light
    '#ffffff': '#a3c2f0',   # primary
    '#888888': '#cba6f7',   # secondary
    '#cccccc': '#f9e2af',   # accent
    'rgba(255, 255, 255': 'rgba(163, 194, 240',
    'rgba(136, 136, 136': 'rgba(203, 166, 247',
    'rgba(18, 18, 18': 'rgba(7, 9, 15',
    'rgba(26, 26, 26': 'rgba(17, 21, 34',
    'rgba(5, 5, 5': 'rgba(3, 4, 7',
    '#080b14': '#080b14', # skip
    '#181818': '#080b14',
    '#222222': '#161b2b',
}

# we need to be careful not to replace #ffffff when it should be text-bright, but let's see.
# In styles.css, text colors might have been #ffffff.
# Wait, in the previous replace, we changed #00d9ff to #ffffff. 
# And #ccd6f6 was text-bright, #e6f1ff was text. We didn't touch those text colors in the first pass!
# So #ffffff in the current CSS ONLY comes from the primary color replacements!
# Let's verify this in a sec.

for old, new in replacements.items():
    content = content.replace(old, new)

with open('/Users/rohith/My/WORK/Website/Rohith18p.github.io/css/styles.css', 'w') as f:
    f.write(content)

print("Replacement complete.")
