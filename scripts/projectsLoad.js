let projects;
let platforms;
let series;

const platformTemplate = document.getElementById("platforms-template");

let platformHeaders = [];

Init();

async function Init() {
    projects = await LoadProjectsData();
    platforms = await LoadPlatformsData();
    series = await LoadSeriesData();

    PageLoad();
}

function PageLoad() {
    //Load the platform headers first
    platforms.forEach(CreateHeader);
}

function CreateHeader(header, index) {
    let headerElement = platformTemplate.content.cloneNode(true);

    let platformHeader = headerElement.querySelector(".platform-header");
    let headerTitle = headerElement.querySelector(".platform-title");
    let contentElement = headerElement.querySelector(".platform-content");

    headerTitle.textContent = header.platformName;
    //contentElement.innerHTML = content;
    contentElement.hidden = true;
    platformHeader.addEventListener("click", () => {
        contentElement.hidden = !contentElement.hidden;
    });

    document.documentElement.append(headerElement);
    platformHeaders.push([headerElement, header.platformID])
}

function ProjectSetup() {

}