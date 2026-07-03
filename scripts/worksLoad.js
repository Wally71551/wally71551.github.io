let music;
let projects;
let musicGrid;

const musicTemplate = document.getElementById("music-grid");
const musicDetailsTemplate = document.getElementById("track-details");
const trackTranscriberListTemplate = document.getElementById("track-transcriber-list-item");
const trackInfoListTemplate = document.getElementById("track-info-list-item");
const trackLinkedTrackTemplate = document.getElementById("track-linked-track-item");
const trackLinkedTrackArtistTemplate = document.getElementById("track-linked-track-artist");
const trackNotesListTemplate = document.getElementById("track-notes-list-item");
const externalLinkIcon = document.getElementById("external-link-icon");

Init();

async function Init()
{
    music = await LoadMusicData();
    projects = await LoadProjectsData();

    PageLoad();
}

function PageLoad()
{
    musicGrid = document.querySelector('.platform-content-grid');
    music.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    music.forEach(MusicSetup);
}

function MusicSetup(musicData, index)
{
    let musicElement = musicTemplate.content.cloneNode(true);
    let image = musicElement.querySelector('img');
    image.src = GetMusicPicture(musicData.imageSrc);

    let title = musicElement.querySelector('.project-title');
    title.textContent = musicData.musicName;

    let subtitle = musicElement.querySelector('.project-subtitle');
    subtitle.textContent = FindTrackProjectName(musicData.projectID);

    let gridItemDiv = musicElement.querySelector('.grid-item');
    gridItemDiv.dataset.musicID = musicData.musicID;
    gridItemDiv.addEventListener('click', (e) => {
        ShowMusicDetails(gridItemDiv);
    });

    musicGrid.append(musicElement);
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

let activeMusicDetailPanel = null;
let activeMusicDetail = "";
function ShowMusicDetails(clickedElement)
{
    let newMusicID = clickedElement.dataset.musicID;

    if(activeMusicDetailPanel && activeMusicDetail === newMusicID)
    {
        CloseMusicActivePanel();
        return;
    }

    if(activeMusicDetailPanel)
    {
        CloseMusicActivePanel();
    }

    //Populate with needed info
    let template = musicDetailsTemplate.content.cloneNode(true);
    let panel = template.querySelector('.track-details-panel');
    let trackData = GetTrack(newMusicID);

    let trackTitle = panel.querySelector('.track-title');
    trackTitle.textContent = trackData.musicName;

    let trackSubtitle = panel.querySelector('.track-subtitle');
    trackSubtitle.textContent = FindTrackProjectName(trackData.projectID);

    let typeText = panel.querySelector('.track-type');
    typeText.textContent = trackData.musicType;

    let trackReleaseDate = panel.querySelector('.release-date');
    trackReleaseDate.innerHTML = `Release Date: ${FormatDateToString(trackData.releaseDate)}`;

    let album = panel.querySelector('.track-album');
    album.innerHTML = `Project: ${FindTrackProjectName(trackData.linkedAlbumID)} — Track #${trackData.linkedAlbumTrack}`;

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

    //Extra notes
    if(trackData.extraNotes != null)
    {
        let addedNote = false;
        let noteList = panel.querySelector('.track-notes-list');

        trackData.extraNotes.forEach((note) => {
            if(note.linkedProject == null || note.linkedProject == "")
            {
                let noteElement = trackNotesListTemplate.content.cloneNode(true);
                let noteP = noteElement.querySelector('p');
                noteP.innerHTML = `<b>※</b> ${note.note}`;
                noteList.appendChild(noteElement);
                addedNote = true;
            }
        });

        if(addedNote == false)
        {
            panel.querySelector('.track-notes-list').remove();
        }
    }
    else
    {
        panel.querySelector('.track-notes-list').remove();
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
    if(trackData.description == null || trackData.description == "")
    {
        panel.querySelector('.track-description-title').remove();
        panel.querySelector('.track-description').remove();
    }
    else
    {
        let trackDescription = panel.querySelector('.track-description');
        trackDescription.innerHTML = trackData.description;
    }

    //Insert onto page
    const nextInsertionPoint = GetEndOfRowElement(clickedElement, musicGrid);
    if(nextInsertionPoint.nextSibling) {
        musicGrid.insertBefore(panel, nextInsertionPoint.nextSibling);
    }
    else {
        musicGrid.appendChild(panel);
    }

    setTimeout(() => {
        panel.classList.add('open');
    }, 10);

    activeMusicDetailPanel = panel;
    activeMusicDetail = newMusicID;
}

function CloseMusicActivePanel()
{
    if(!activeMusicDetailPanel)
    {
        return;
    }

    let panelToClose = activeMusicDetailPanel;
    panelToClose.classList.remove('open');

    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
    }, 300);

    activeMusicDetailPanel = null;
    activeMusicDetail = "";
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

    if(projectString == "")
    {
        return projectId;
    }

    return projectString;
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