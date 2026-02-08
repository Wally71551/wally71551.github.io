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
                    </ul>
                    <li>Enhanced versions / re-releases include both the base soundtrack plus the new soundtrack/new tracks.</li>
                    <li>Remakes that use the same soundtrack also get the music listing on that project too.</li>
                </ul>
            </div>

            <site-footer-copyright></site-footer-copyright>
        </footer>
        `;
    }
}
customElements.define('project-footer', ProjectFooter)