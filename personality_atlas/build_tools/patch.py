import re, sys

MARK = '/* ===== Atlas extensions'

def patch(src, dst, css='', btns='', feat_path='features.js'):
    h = open(src, encoding='utf-8').read()
    feat = open(feat_path, encoding='utf-8').read().replace('</', '<\\/')

    # 1. replace the injected feature block with the current features.js
    i = h.find(MARK)
    j = h.rfind('</script>')
    assert i > 0 and j > i, 'feature block not found'
    h = h[:i] + feat + '\n' + h[j:]

    # 2. append CSS (later rules win)
    if css:
        assert '</style>' in h
        h = h.replace('</style>', css + '</style>', 1)

    # 3. add toolbar buttons after the home link
    if btns:
        anchor = '<a id="homeBtn"'
        k = h.index(anchor)
        end = h.index('</a>', k) + 4
        h = h[:end] + btns + h[end:]

    open(dst, 'w', encoding='utf-8').write(h)
    print(dst, len(h))

if __name__ == '__main__':
    css = open('extra.css').read() if len(sys.argv) > 1 and sys.argv[1] == '--css' else ''
    btns = open('extra_btns.html').read().strip() if len(sys.argv) > 2 else ''
    patch('base_cooked.html', 'new_cooked.html', css, btns)
    patch('base_harvested.html', 'new_harvested.html', css, btns)
