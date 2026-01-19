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
    platforms.forEach(CreateHeader);
}

function CreateHeader(header, index)
{
    let headerElement = platformTemplate.content.cloneNode(true);

    let platformHeader = headerElement.querySelector(".platform-header");
    let headerTitle = headerElement.querySelector(".platform-title");
    let headerImage = headerElement.querySelector(".platform-image");
    let contentElement = headerElement.querySelector(".platform-content-grid");

    headerTitle.textContent = header.platformName;
    contentElement.hidden = false;
    platformHeader.addEventListener("click", () => {
        contentElement.hidden = !contentElement.hidden;
    });

    if(header.platformImageSrc != "")
    {
        headerImage.src = GetPlatformPicture(header.platformImageSrc);
    }

    let platProjects = platformProjects.get(header.platformID);
    if(platProjects != undefined)
    {
        for(let i = 0; i < platProjects.length; i++)
        {
            let projectElement = projectTemplate.content.cloneNode(true);
            let projectData = FindProject(platProjects[i]);

            let image = projectElement.querySelector('img');
            image.src = GetProjectPicture(projectData.imageSrc);

            let title = projectElement.querySelector('p');
            title.textContent = projectData.projectName;

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
            let projects = platformProjects.get(project.platformIDs[i].platform);
        
            //Alphabetical order sorting
            let hasSorted = false;
            for(let j = 0; j < projects.length; j++)
            {
                let comparison = FindProject(projects[j]);
                let comparisonReleaseDate = comparison.platformIDs.find(p => p.platform === project.platformIDs[i].platform)?.releaseDate ?? null;

                if(comparisonReleaseDate == null)
                {
                    continue;
                }

                if(project.platformIDs[i].releaseDate > comparisonReleaseDate)
                {
                    projects.splice(j, 0, project.projectID);
                    hasSorted = true;
                    break;
                }
                else if(project.platformIDs[i].releaseDate === comparisonReleaseDate)
                {
                    if(project.projectName.localeCompare(comparison.projectName) == false)
                    {
                        projects.splice(j, 0, project.projectID);
                        hasSorted = true;
                        break;
                    }
                }
            }

            //Push on end if not sorted in and write back to map
            if(hasSorted == false)
            {
                projects.push(project.projectID);
            }

            platformProjects.set(project.platformIDs[i].platform, projects);
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