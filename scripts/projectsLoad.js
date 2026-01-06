let projects;
let platforms;
let series;

const platformTemplate = document.getElementById("platforms-template");
const projectTemplate = document.getElementById("project-grid");

let platformHeaders = [];
const platformProjects = new Map();

Init();

async function Init()
{
    projects = await LoadProjectsData();
    platforms = await LoadPlatformsData();
    series = await LoadSeriesData();

    PageLoad();
}

function PageLoad()
{
    //Set up the project setup arrays
    projects.forEach(ProjectSetup);

    //Sort each of the elements into release date order

    platforms.forEach(CreateHeader);
}

function CreateHeader(header, index)
{
    let headerElement = platformTemplate.content.cloneNode(true);

    let platformHeader = headerElement.querySelector(".platform-header");
    let headerTitle = headerElement.querySelector(".platform-title");
    let contentElement = headerElement.querySelector(".platform-content-grid");

    headerTitle.textContent = header.platformName;
    contentElement.hidden = false;
    platformHeader.addEventListener("click", () => {
        contentElement.hidden = !contentElement.hidden;
    });

    let platProjects = platformProjects.get(header.platformID);
    if(platProjects != undefined)
    {
        for(let i = 0; i < platProjects.length; i++)
        {
            let projectElement = projectTemplate.content.cloneNode(true);
            let projectData = FindProject(platProjects[i]);

            let image = projectElement.querySelector('img');
            image.src = projectData.imageSrc;

            contentElement.append(projectElement);
        }
    }

    document.documentElement.append(headerElement);
    platformHeaders.push([header.platformID, headerElement])
}

function ProjectSetup(project, index)
{
    for(let i = 0; i < project.platformIDs.length; i++)
    {
        if(platformProjects.has(project.platformIDs[i].platform))
        {
            let temp = platformProjects.get(project.platformIDs[i].platform);
            temp.push(project.projectID);
            platformProjects.set(project.platformIDs[i].platform, temp);
        }
        else
        {
            platformProjects.set(project.platformIDs[i].platform, [project.projectID]);
        }
    }
}

function FindProject(id)
{
    for(let i = 0; i < projects.length; i++)
    {
        if(projects[i].projectID == id)
        {
            return projects[i];
        }
    }
}