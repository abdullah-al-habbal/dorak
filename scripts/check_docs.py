"""Checks Markdown outside .claude/: relative links, heading anchors, frontmatter codeanchors, backlog IDs, and
that docs/index.md or docs/graph/ lists every document.

usage: python3 scripts/check_docs.py   (run from the repository root; exit 1 when anything fails)
"""
import collections
import os
import re
import subprocess
import sys

files = [
    f for f in subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard', '*.md'], text=True).splitlines()
    if os.path.isfile(f) and '.claude/' not in f
]
LINK = re.compile(r'\[(?:[^\[\]]|\[[^\]]*\])*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)')


def strip_code(text):
    text = re.sub(r'^(```|~~~).*?^\1\s*$', '', text, flags=re.S | re.M)
    return re.sub(r'`[^`\n]*`', 'x', text)


def slugs(path):
    text = re.sub(r'^(```|~~~).*?^\1\s*$', '', open(path, encoding='utf-8').read(), flags=re.S | re.M)
    seen, result = collections.Counter(), set()
    for heading in re.findall(r'^#{1,6}\s+(.*?)\s*#*\s*$', text, flags=re.M):
        plain = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', heading).replace('`', '')
        slug = re.sub(r'[^\w\- ]', '', plain.lower()).replace(' ', '-')
        result.add(slug if not seen[slug] else f'{slug}-{seen[slug]}')
        seen[slug] += 1
    result.update(re.findall(r'<a\s+(?:id|name)="([^"]+)"', text))
    return result


errors = []
for source in files:
    raw = open(source, encoding='utf-8').read()
    for target in LINK.findall(strip_code(raw)):
        if re.match(r'^[a-z][a-z0-9+.-]*:', target, flags=re.I):
            continue
        path, _, anchor = target.partition('#')
        resolved = os.path.normpath(os.path.join(os.path.dirname(source), path)) if path else source
        if not os.path.exists(resolved):
            errors.append(f'link: {source} -> {target}')
        elif anchor and resolved.endswith('.md') and anchor not in slugs(resolved):
            errors.append(f'anchor: {source} -> {target}')
    front = re.match(r'^---\n(.*?)\n---\n', raw, flags=re.S)
    if front:
        block = re.search(r'^codeanchors:\s*\n((?:\s+-\s+.*\n?)+)', front.group(1) + '\n', flags=re.M)
        if block:
            for item in re.findall(r'-\s+(\S+)', block.group(1)):
                if not os.path.exists(item.strip('"\'')):
                    errors.append(f'codeanchor: {source} -> {item}')

backlog = open('docs/backlog/index.md', encoding='utf-8').read()
ids = re.findall(r'^(?:\| |- |\s+- )((?:BD|BG|FT|TD|TS|RR)-\d+[a-z]?)\b', backlog, flags=re.M)
errors += [f'duplicate id: {i}' for i, n in collections.Counter(ids).items() if n > 1]

# Not listed by design: the router itself, parts of a document (reached from its first file), reference folders
# (linked from their guides).
routers = [f for f in files if f == 'docs/index.md' or f.startswith('docs/graph/')]
listed = {
    os.path.normpath(os.path.join(os.path.dirname(router), target.partition('#')[0]))
    for router in routers
    for target in LINK.findall(strip_code(open(router, encoding='utf-8').read()))
}
errors += [
    f'not listed in docs/index.md or docs/graph/: {f}'
    for f in files
    if f not in listed and f != 'docs/index.md' and not f.startswith('docs/graph/')
    and not re.search(r'-(part|group)-\d+\.md$', f) and '/references/' not in f
]

print('\n'.join(errors))
print(f'{len(files)} files, {len(errors)} errors')
sys.exit(1 if errors else 0)
