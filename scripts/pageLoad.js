function FormatDateToString(date) {
    let cleanDate = date.split('_')[0];
    cleanDate = cleanDate.split('[')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    const formattedDate = new Date(year, month - 1, day);
    
    const monthName = formattedDate.toLocaleString('en-GB', { month: 'long' });

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    let returnString = `${monthName} ${getOrdinal(day)}, ${year}`;
    if(date.includes('['))
    {
        returnString = `${returnString} [${date.split('[')[1]}`;
    }

    return returnString;
}

class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
                <div class="header-logo">
                    <a href="/">
                        <img src="images/WallyFullLogo.webp" alt="Wally71551 Logo" height=auto>
                    </a> 
                </div>
                <nav class="header-nav">
                    <ul>
                        <li><a href="/works.html"><p>Works</p></a></li>
                        <li><a href="/timeline.html"><p>Timeline</p></a></li>
                        <li><a href="/projects.html"><p>Project Library</p></a></li>
                    </ul>
                </nav>
            </header>
        `;

        const currentPath = window.location.pathname;
        const navLinks = this.querySelectorAll('nav ul li a');

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.parentElement.classList.add('active');
                link.classList.add('active');
            }
        });
    }
}
customElements.define('site-header', SiteHeader);

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer class="site-footer">
        <site-footer-copyright></site-footer-copyright>
    </footer>
    `;
  }
}
customElements.define('site-footer', SiteFooter);

class SiteFooterCopyright extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="footer-copyright">
            <p>© 2026 Wally71551 | All rights reserved.</p>
            <p style="font-size:0.8em;">Site Version v0.1</p>
        </div>
        `
    }
}
customElements.define('site-footer-copyright', SiteFooterCopyright)