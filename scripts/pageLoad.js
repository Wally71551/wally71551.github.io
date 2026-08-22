function FormatDateToString(date) {
    if(date.includes('('))
    {
        return date.match(/\(([^)]+)\)/)[1];
    }

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

function GetEndOfRowElement(clickedElement, container) {
    const allItems = Array.from(container.children).filter(el => el.classList.contains('grid-item'));
    const clickedRect = clickedElement.getBoundingClientRect();
    const clickedTop = clickedRect.top;
    
    let lastItemInRow = clickedElement;

    const currentIndex = allItems.indexOf(clickedElement);
    
    for (let i = currentIndex + 1; i < allItems.length; i++) {
        const item = allItems[i];
        const itemRect = item.getBoundingClientRect();
        
        if (Math.abs(itemRect.top - clickedTop) > 20) { 
            break;
        }
        lastItemInRow = item;
    }
    
    return lastItemInRow;
}

function ConvertToMarkdown(unparsedString)
{
    if(typeof window.marked === 'undefined')
    {
        return unparsedString;
    }

    return window.marked.parse(unparsedString);
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
                        <li><a href="/projects.html"><p>Project Library</p></a></li>
                        <li><a href="/totd.html"><p>Track of the Day</p></a></li>
                        <li><a href="/reviews.html"><p>Reviews</p></a></li>
                        <li><a href="/timeline.html"><p>Timeline</p></a></li>
                    </ul>
                </nav>
            </header>
        `;

        const currentPath = window.location.pathname;
        const navLinks = this.querySelectorAll('nav ul li a');

        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath || link.getAttribute('href') === currentPath + ".html") {
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
            <p style="font-size:0.8em;">Site Version v0.3</p>
            <p style="font-size: 1em; padding-top:0.6rem;">Uicons by <a href="https://www.flaticon.com/uicons">Flaticon</a>
        </div>
        `
    }
}
customElements.define('site-footer-copyright', SiteFooterCopyright)