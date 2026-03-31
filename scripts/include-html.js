async function includeHTML() {
  while (true) {
    const includes = document.querySelectorAll('[data-include]:not([data-include-loaded])')
    if (!includes.length) break

    for (const el of includes) {
      const url = el.getAttribute('data-include')
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(res.status)
        const html = await res.text()
        el.innerHTML = html
      } catch (e) {
        // Fallback for local file:// previews where fetch is often blocked.
        if (window.location.protocol === 'file:') {
          try {
            const html = await loadIncludeWithXHR(url)
            el.innerHTML = html
          } catch (xhrErr) {
            console.warn('Include failed:', url, xhrErr)
          }
        } else {
          console.warn('Include failed:', url, e)
        }
      }

      el.setAttribute('data-include-loaded', 'true')
    }
  }

  // After includes are inserted, highlight current nav link
  highlightNav()
}

function loadIncludeWithXHR(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = () => {
      // file:// requests often report status 0 when successful.
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
        resolve(xhr.responseText)
      } else {
        reject(new Error(`XHR status ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('XHR failed'))
    xhr.send()
  })
}

function highlightNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html'
  const normalized = path.toLowerCase()
  const navLinks = document.querySelectorAll('.nav-links a')
  navLinks.forEach(a => {
    const href = a.getAttribute('href') || ''
    if (href.toLowerCase() === normalized || href.toLowerCase() === normalized.replace('.html','.php')) {
      a.classList.add('current')
    } else {
      a.classList.remove('current')
    }
  })
}

document.addEventListener('DOMContentLoaded', includeHTML)
