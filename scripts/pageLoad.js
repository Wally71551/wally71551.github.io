function FormatDateToString(date) {
    const cleanDate = date.split('_')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    const formattedDate = new Date(year, month - 1, day);
    
    const monthName = formattedDate.toLocaleString('en-GB', { month: 'long' });

    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${monthName} ${getOrdinal(day)}, ${year}`;
}

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
        </div>
        `
    }
}
customElements.define('site-footer-copyright', SiteFooterCopyright)

class ProjectFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="site-footer">
            <div class="project-library-footer">
                <ul>
                    <li>Projects only contain the music that is on their original soundtrack (if it exists), otherwise it appears on the first project it appeared on.</li>
                    <ul>
                        <li>For sequels, if they are included on the original soundtrack it appears in that list too, if there is no soundtrack release it won't be there even if it's reused.</li>
                        <li>This also applies to remixes, if a track is remixed in another project only the base version is used.</li>
                        <li>If a track only appears on a soundtrack for a project when it has already appeared in another one, every instance of its use before the soundtrack release is also listed.</li>
                    </ul>
                    <li>Enhanced versions / re-releases include both the base soundtrack plus the new soundtrack/new tracks.</li>
                    <li>Remakes that use the same soundtrack also get the music listing on that project too.</li>
                    <li>Ports are included unless they are in collections/compilations—larger-scope lines of emulated ports such as <em>Virtual Console</em>, <em>Nintendo Classics</em> or <em>PlayStation Plus Classics Catalogue</em> are also omitted as the games are presented completely as they were on the original platform.
                    <ul>
                        <li>However, this is not the case for projects that are first being made available through these avenues.
                    </ul>
                    <li>All release dates are the UK dates where applicable, English language dates if no UK date exists, and then the initial release if none are beyond that.
                </ul>
            </div>

            <site-footer-copyright></site-footer-copyright>
        </footer>
        `;
    }
}
customElements.define('project-footer', ProjectFooter)