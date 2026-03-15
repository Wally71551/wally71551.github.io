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
const trackInfoListTemplate = document.getElementById("track-info-list-item");
const trackLinkedTrackTemplate = document.getElementById("track-linked-track-item");
const trackLinkedTrackArtistTemplate = document.getElementById("track-linked-track-artist");
const externalLinkIcon = document.getElementById("external-link-icon");

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

            let imageSource = projectData.imageSrc;
            let result = projectData.platformIDs.find(obj => { return obj.platform === header.platformID})
            if(result && result.overrideImage != null && result.overrideImage != "")
            {
                imageSource = result.overrideImage;
            }
            image.src = GetProjectPicture(imageSource);

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
    
    let releaseDate = panel.querySelector('.release-date');
    for(let i = 0; i < projectData.platformIDs.length; i++)
    {
        if(projectData.platformIDs[i].platform == projectPlatform)
        {
            let rel = projectData.platformIDs[i].releaseDate;
            if(rel == null || rel == "" || rel == "null") {
                releaseDate.remove();
            }
            else
            {
                releaseDate.textContent = `Release Date: ${FormatDateToString(rel)}`;
            }
        }
    }

    //Collection
    if(projectData.collectionItems == null || projectData.collectionItems.length <= 0)
    {
        panel.querySelector('.project-collection-header').remove();
        panel.querySelector('.project-collection-list').remove();
    }
    else
    {
        let listElement = panel.querySelector('.project-collection-list');
        projectData.collectionItems.forEach(collectionItem => {
            let element = document.createElement("h4");
            element.innerHTML = collectionItem;
            element.classList.add("project-collection-item");

            if(collectionItem == projectData.collectionItems[projectData.collectionItems.length - 1])
            {
                element.classList.add('track-linked-track-item-end');
            }

            listElement.appendChild(element);
        });
    }

    //Description
    if(projectData.description == null || projectData.description == "")
    {
        panel.querySelector('.project-description').remove();
    }
    else
    {
        let projectDescription = panel.querySelector('.project-description');
        projectDescription.innerHTML = projectData.description;
    }

    //Track list insertion
    let trackList = panel.querySelector('.project-track-list');
    for(let j = 0; j < projectData.musicList.length; j++)
    {
        let trackData = GetTrack(projectData.musicList[j]);
        let trackDisplay = SetUpTrackList(trackData, projectData);

        if(j == projectData.musicList.length - 1)
        {
            trackDisplay.classList.add('track-list-item-end');
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
    panelToClose.classList.remove('open');
    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
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

function SetUpTrackList(trackData, projectData)
{
    let template = trackListTemplate.content.cloneNode(true);
    let panel = template.querySelector('.track-list-item');
    let projectTitle = panel.querySelector('.track-list-name');
    projectTitle.textContent = trackData.musicName;
    let trackProject = panel.querySelector('.track-project-name');
    trackProject.textContent = FindTrackProjectName(trackData.projectID);

    let trackNumber = panel.querySelector('.track-list-album-number');
    if(trackData.linkedAlbumID == projectData.projectID)
    {
        trackNumber.textContent = trackData.linkedAlbumTrack;
    }
    else
    {
        trackNumber.remove();
    }

    let trackIconHeader = panel.querySelector('.track-link-buttons');
    if(trackData.extraLinks != null)
    {
        trackData.extraLinks.forEach((extraTrack) => {
            trackIconHeader.appendChild(MakeExternalLinkIcon(extraTrack.platform, extraTrack.url));
        });
    }

    if(trackData.youtubeLink != null && trackData.youtubeLink != "")
    {
        trackIconHeader.appendChild(MakeExternalLinkIcon("youtube", trackData.youtubeLink));
    }
    if(trackData.bandcampLink != null && trackData.bandcampLink != "")
    {
        trackIconHeader.appendChild(MakeExternalLinkIcon("bandcamp", trackData.bandcampLink));
    }

    let textPanel = panel.querySelector('.track-list-header-text');
    textPanel.addEventListener('click', (e) => {
            ShowTrackDetails(panel);
        });

    panel.dataset.trackId = trackData.musicID;
    panel.dataset.projectID = projectData.projectID;
    return panel;
}

let activeTrackDetailPanel = null;
let activeTrackList = "";
function ShowTrackDetails(clickedElement)
{
    let newTrackId = clickedElement.dataset.trackId;
    let projectID = clickedElement.dataset.projectID;

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

    let trackReleaseDate = panel.querySelector('.release-date');
    trackReleaseDate.innerHTML = `Release Date: ${FormatDateToString(trackData.releaseDate)}`;

    if(trackData.linkedAlbumID != projectID && trackData.linkedAlbumID && trackData.linkedAlbumID != "")
    {
        let album = panel.querySelector('.track-album');
        album.innerHTML = `Project: ${FindTrackProjectName(trackData.linkedAlbumID)} — Track #${trackData.linkedAlbumTrack}`;
    }
    else
    {
        panel.querySelector('.track-album');
    }

    let trackArranger = panel.querySelector('.track-arranger');
    trackArranger.textContent = `Arranger: ${trackData.trackArranger}`

    //Handling linked tracks
    let trackLinkDisplaying = false;
    if(trackData.linkedTracks == null || trackData.linkedTracks.length <= 0)
    {
        panel.querySelector('.linked-track-header').remove();
    }
    else
    {
        //Header setting
        let trackLinkedListHeader = panel.querySelector('.linked-track-header');
        trackLinkDisplaying = true;

        switch(trackData.musicType)
        {
            case "Remix":
            case "Original":
                trackLinkedListHeader.textContent = "Based On"
                break;
            case "Medley":
                trackLinkedListHeader.textContent = "Medley Tracks"
                break;
        }

        let trackLinkedListDisplay = panel.querySelector('.track-linked-tracks');
        trackData.linkedTracks.forEach((linkedTrack) => {
            let linkedTrackTemplate = trackLinkedTrackTemplate.content.cloneNode(true);
            let trackName = linkedTrackTemplate.querySelector('.track-list-name');
            trackName.textContent = linkedTrack.name;
            let trackProject = linkedTrackTemplate.querySelector('.track-project-name');
            trackProject.textContent = linkedTrack.project;

            let linkedTrackArtists = linkedTrackTemplate.querySelector('.linked-track-artists');
            linkedTrack.artists.forEach((artist) => {
                let hasRef = artist.URL && artist.URL != ""
                let artistTemplate = trackLinkedTrackArtistTemplate.content.cloneNode(true);
                let artistElement = artistTemplate.querySelector('.linked-track-artist-info');

                if(hasRef)
                {
                    artistElement.innerHTML = `<strong>${artist.header}:</strong> <a href="${artist.URL}">${artist.artistName}</a>`;
                }
                else
                {
                    artistElement.innerHTML = `<strong>${artist.header}:</strong> ${artist.artistName}`;
                }
                
                linkedTrackArtists.appendChild(artistTemplate);
            });

            //Remove bottom line
            if(trackData.linkedTracks[trackData.linkedTracks.length - 1].name == linkedTrack.name)
            {
                linkedTrackTemplate.querySelector('.track-linked-track-item').classList.add('track-linked-track-item-end');
            }
            trackLinkedListDisplay.appendChild(linkedTrackTemplate);
        });
    }

    if(trackData.composer && trackData.composer != "")
    {
        let trackComposers = panel.querySelector('.track-composer');
        trackComposers.innerHTML = `<strong>Composer:</strong> ${trackData.composer}`;
    }
    else
    {
        panel.querySelector('.track-composer').remove();
    }

    //Handle original track artists
    if(trackData.artists && trackData.artists.length > 0)
    {
        let trackArtists = panel.querySelector('.track-info-list');
        trackData.artists.forEach((artistData) => {
            let artistTemplate = trackInfoListTemplate.content.cloneNode(true);
            let artistText = artistTemplate.querySelector('.artist-info');
            artistText.innerHTML = `<strong>${artistData.header}:</strong> ${artistData.artistName}`;
            trackArtists.appendChild(artistTemplate);
        })
    }
    else
    {
        panel.querySelector('.track-info-list').remove();
    }

    if(trackLinkDisplaying || (!trackData.composer || trackData.composer == "" )&& (!trackData.artists || trackData.artists.length <= 0))
    {
        panel.querySelector('.track-info-header').remove();
    }

    //Handling transcribers
    if(trackData.transcription == null || trackData.transcription.length <= 0)
    {
        panel.querySelector('.track-transcriber-header').remove();
    }
    else
    {
        if(trackData.transcription.length == 1)
        {
            panel.querySelector('.track-transcriber-header').textContent = "Transcriber";
        }
        
        let trackTranscriberListDisplay = panel.querySelector('.track-transcriber-list');
        trackData.transcription.forEach((transcriptionData) => {
            let transcriptionTemplate = trackTranscriberListTemplate.content.cloneNode(true);
            let link = transcriptionTemplate.querySelector('.artist-info');
            link.innerHTML = transcriptionData.transcriber;
            link.href = transcriptionData.url;
            trackTranscriberListDisplay.appendChild(transcriptionTemplate);
        });
    }

    //Handling description
    let trackDescription = panel.querySelector('.track-description');
    trackDescription.innerHTML = trackData.description;

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
    panelToClose.classList.remove('open');

    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
    }, 300);

    activeTrackDetailPanel = null;
    activeTrackList = "";
}

function MakeExternalLinkIcon(websiteName, url)
{
    let externalLinkTemplate = externalLinkIcon.content.cloneNode(true);
    let link = externalLinkTemplate.querySelector('.external-link');
    link.href = url;
    let linkIcon = externalLinkTemplate.querySelector('.external-link-display-icon');
    linkIcon.src = "icons/" + websiteName + ".svg";
    return externalLinkTemplate;
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