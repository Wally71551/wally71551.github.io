let projects;
let platforms;
let series;
let music;

const platformTemplate = document.getElementById("platforms-template");
const projectTemplate = document.getElementById("project-grid");
const projectDetailsTemplate = document.getElementById("project-details");
const trackListTemplate = document.getElementById("track-list-item");
const trackDetailsTemplate = document.getElementById("track-details");
const trackTranscriberListTemplate = document.getElementById("track-transcriber-list-item");
const trackLinkedTrackTemplate = document.getElementById("track-linked-track-item");

let platformHeaders = [];
const platformProjects = new Map();

Init();

async function Init()
{
    music = await LoadMusicData();
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

            let projectCountDisplay = projectElement.querySelector('span');
            projectCountDisplay.textContent = projectData.musicList.length;

            let gridItemDiv = projectElement.querySelector('.grid-item');
            gridItemDiv.dataset.projectId = projectData.projectID;
            gridItemDiv.dataset.platformId = header.platformID;
            gridItemDiv.addEventListener('click', (e) => {
                ShowProjectDetails(gridItemDiv, contentElement);
            })

            contentElement.append(projectElement);
        }
    }

    const content = document.getElementById("content");
    content.append(headerElement);
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

let activeDetailPanel = null;
let activeProjectId = "";
let activeProjectPlatform = "";
function ShowProjectDetails(clickedElement, gridContainer)
{
    let newProjectId = clickedElement.dataset.projectId;
    let newProjectPlat = clickedElement.dataset.platformId;

    if(activeDetailPanel && newProjectId === activeProjectId && activeProjectPlatform === newProjectPlat)
    {
        CloseActivePanel();
        return;
    }

    if(activeDetailPanel)
    {
        CloseActivePanel();
    }

    //
    //Populate project details template with the needed data
    //
    let template = projectDetailsTemplate.content.cloneNode(true);
    let panel = template.querySelector('.project-details-panel');
    let projectData = FindProject(clickedElement.dataset.projectId);
    let projectPlatform = clickedElement.dataset.platformId;
    let title = panel.querySelector('.project-detailed-title');
    title.textContent = projectData.projectName;
    let typeText = panel.querySelector('.project-type');
    typeText.textContent = projectData.projectType;
    
    let releaseDate = panel.querySelector('.project-release-date');
    for(let i = 0; i < projectData.platformIDs.length; i++)
    {
        if(projectData.platformIDs[i].platform == projectPlatform)
        {
            releaseDate.textContent = FormatDateToString(projectData.platformIDs[i].releaseDate);
        }
    }

    //Track list insertion
    let trackList = panel.querySelector('.project-track-list');
    for(let j = 0; j < projectData.musicList.length; j++)
    {
        let trackData = GetTrack(projectData.musicList[j]);
        let trackDisplay = SetUpTrackList(trackData);

        if(j == projectData.musicList.length - 1)
        {
            trackDisplay.classList.add('track-list-item-end')
        }

        trackList.appendChild(trackDisplay);
    }

    //Insert onto page
    const nextInsertionPoint = GetEndOfRowElement(clickedElement, gridContainer);
    if (nextInsertionPoint.nextSibling) {
        gridContainer.insertBefore(panel, nextInsertionPoint.nextSibling);
    } else {
        gridContainer.appendChild(panel);
    }

    setTimeout(() => {
        panel.classList.add('open');
    }, 10);

    activeDetailPanel = panel;
    activeProjectId = newProjectId;
    activeProjectPlatform = newProjectPlat;
}

function CloseActivePanel() {
    if(!activeDetailPanel)
    {
        return;
    }

    let panelToClose = activeDetailPanel;

    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
        panelToClose.classList.remove('open');
    }, 300);

    activeDetailPanel = null;
    activeProjectId = "";
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

function SetUpTrackList(trackData)
{
    let template = trackListTemplate.content.cloneNode(true);
    let panel = template.querySelector('.track-list-item');
    let projectTitle = panel.querySelector('.track-list-name');
    projectTitle.textContent = trackData.musicName;
    let trackProject = panel.querySelector('.track-project-name');
    trackProject.textContent = FindTrackProjectName(trackData.projectID);

    panel.addEventListener('click', (e) => {
            ShowTrackDetails(panel);
        });

    panel.dataset.trackId = trackData.musicID;
    return panel;
}

let activeTrackDetailPanel = null;
let activeTrackList = "";
function ShowTrackDetails(clickedElement)
{
    let newTrackId = clickedElement.dataset.trackId;

    if(activeTrackDetailPanel && activeTrackList === newTrackId)
    {
        CloseTrackActivePanel();
        return;
    }

    if(activeTrackDetailPanel)
    {
        CloseTrackActivePanel();
    }

    //Populate with needed info
    let template = trackDetailsTemplate.content.cloneNode(true);
    let panel = template.querySelector('.track-details-panel');
    let trackData = GetTrack(newTrackId);
    let typeText = panel.querySelector('.track-type');
    typeText.textContent = trackData.musicType;
    let trackReleaseDate = panel.querySelector('.track-release-date');
    trackReleaseDate.textContent = FormatDateToString(trackData.releaseDate);
    let trackArranger = panel.querySelector('.track-arranger');
    trackArranger.textContent = `Arranged by ${trackData.trackArranger}`

    let trackComposers = panel.querySelector('.track-composer');
    trackComposers.textContent = `Composed by ${trackData.composer}`;

    let trackOriginalArrangers = panel.querySelector('.track-original-arranger');
    if(trackData.arranger != null)
    {
        trackOriginalArrangers.textContent = `Original Track Arranged by ${trackData.arranger}`;
    }
    else
    {
        trackOriginalArrangers.remove();
    }

    //Handling transcribers
    if(trackData.transcription == null)
    {
        panel.querySelector('.track-transcriber-header').remove();
    }
    else
    {
        let trackTranscriberListDisplay = panel.querySelector('.track-transcriber-list');
        trackData.transcription.forEach((transcriptionData) => {
        let transcriptionTemplate = trackTranscriberListTemplate.content.cloneNode(true);
        let link = transcriptionTemplate.querySelector('.transcriber-info');
        link.textContent = transcriptionData.transcriber;
        link.href = transcriptionData.url;
        trackTranscriberListDisplay.appendChild(transcriptionTemplate);
        });
    }


    //Handling linked tracks
    if(trackData.linkedTracks == null)
    {
        panel.querySelector('.linked-track-header').remove();
    }
    else
    {
        let trackLinkedListDisplay = panel.querySelector('.track-linked-tracks');
        trackData.linkedTracks.forEach((linkedTrack) => {
            let linkedTrackTemplate = trackLinkedTrackTemplate.content.cloneNode(true);
        });
    }
    

    //Insert onto page
    clickedElement.appendChild(panel);

    setTimeout(() => {
        panel.classList.add('open');
    }, 10);

    activeTrackDetailPanel = panel;
    activeTrackList = newTrackId;
}

function CloseTrackActivePanel()
{
    if(!activeTrackDetailPanel)
    {
        return;
    }

    let panelToClose = activeTrackDetailPanel;

    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
        panelToClose.classList.remove('open');
    }, 300);

    activeTrackDetailPanel = null;
    activeTrackList = "";
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

function GetTrack(id)
{
    for(let i = 0; i < music.length; i++)
    {
        if(music[i].musicID == id)
        {
            return music[i];
        }
    }
}

function FindPlatformName(id)
{
    for(let i = 0; i < platforms.length; i++)
    {
        if(platforms[i].platformID == id)
        {
            return platforms[i].platformName;
        }
    }
}

function FindTrackProjectName(projectId)
{
    let projects = projectId.split("/");
    let projectString = "";

    for(let i = 0; i < projects.length; i++)
    {
        if(i > 0)
        {
            projectString += " & ";
        }

        projectString += (FindProject(projects[i]).projectName);
    }

    return projectString;
}