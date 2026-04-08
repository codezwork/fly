import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace $ with ₹ when it's used for price.
    # Cases to replace:
    # 1. ${product.price} inside JSX, e.g., >${...}< or > ${...} < or >${...}
    # 2. ${item.price} or ${total} inside JSX
    # 3. $ followed by digits: $150, $200
    
    # We should NOT replace $ inside backticks: `${...}`
    # To do this safely, let's just replace:
    # `\$\{` with `₹{` ONLY if it is preceded by `>` or ` ` (space) or `"` depending on context, but NOT ```
    
    # Actually, a simpler heuristic for this Next.js app:
    # Find all `${` and replace with `₹{` ONLY if they are NOT inside backticks.
    # A simple way to check if inside backticks is to count backticks before the match. 
    # If the number of backticks before the match is even, we are OUTSIDE backticks.
    # (This assumes no escaped backticks, which is usually fine).
    
    lines = content.split('\n')
    new_lines = []
    changed = False
    
    for line in lines:
        original_line = line
        
        # Replace $ not followed by { (e.g. $150)
        line = re.sub(r'\$(?=\d)', '₹', line)
        
        # Replace ${...} that are inside JSX text
        # usually looks like >${ or > ${ or } ${
        line = re.sub(r'>\s*\$\{', '>₹{', line)
        line = re.sub(r'\}\s*\$\{', '}₹{', line)
        
        if line != original_line:
            changed = True
        new_lines.append(line)

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f'Updated {filepath}')

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))
