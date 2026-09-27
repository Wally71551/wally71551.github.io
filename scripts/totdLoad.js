let totd;
let currentTOTDYear;
let currentTOTDSection;
let currentTOTDGrid;
let previousDate;

const totdYearTemplate = document.getElementById("totd-year");
const totdTemplate = document.getElementById("totd-grid");

const totdDetailsTemplate = document.getElementById("track-details");
const totdInfoListTemplate = document.getElementById("track-info-list-item");
const totdLinkedTrackTemplate = document.getElementById("track-linked-track-item");
const totdLinkedTrackArtistTemplate = document.getElementById("track-linked-track-artist");
const totdNotesListTemplate = document.getElementById("track-notes-list-item");
const externalLinkIcon = document.getElementById("external-link-icon");

Init();

async function Init()
{
    totd = await LoadTOTDData();
    currentTOTDYear = -1;

    PageLoad();
}

function PageLoad()
{
    totdContainer = document.getElementsByClassName("totd-body")[0];
    totd.forEach(AddTOTD);
}

function AddTOTD(totdData, index)
{
    //Check for new year
    let date = totdData.totdDate.split('-');
    let year = date[0];
    if(year > currentTOTDYear)
    {
        currentTOTDSection = CreateNewSection(year);
    }

    let totdElement = totdTemplate.content.cloneNode(true);

    let totdDate = totdElement.querySelector('.totd-date');
    totdDate.textContent = date[2] + "/" + date[1];

    let image = totdElement.querySelector('img');
    image.src = GetTOTDPicture(totdData.imageSrc);

    let title = totdElement.querySelector('.totd-title');
    title.textContent = totdData.totdName;

    if(totdData.totdAlbum != null && totdData.totdAlbum != "")
    {
        let album = totdElement.querySelector('.totd-album');
        album.textContent = totdData.totdAlbum;
    }
    else
    {
        totdElement.querySelector('.totd-album').remove();
    }

    if(totdData.totdArtist != null && totdData.totdArtist != "")
    {
        let artist = totdElement.querySelector('.totd-artist');
        artist.textContent = totdData.totdArtist;
    }
    else
    {
        totdElement.querySelector('.totd-artist').remove();
    }

    let gridItemDiv = totdElement.querySelector('.grid-item');
    gridItemDiv.dataset.totdID = totdData.totdID;
    gridItemDiv.addEventListener('click', (e) => {
        ShowTOTDDetails(gridItemDiv);
    });

    currentTOTDGrid.insertBefore(totdElement, currentTOTDGrid.firstChild);
}

function CreateNewSection(year)
{
    currentTOTDYear = year;
    let newYearSection = totdYearTemplate.content.cloneNode(true);
    currentTOTDSection = newYearSection.object;
    let timelineYearHeader = newYearSection.querySelector('.totd-year-header');
    timelineYearHeader.innerText = year;
    currentTOTDGrid = newYearSection.querySelector('.platform-content-grid');

    totdContainer.insertBefore(newYearSection, totdContainer.firstChild);
    return newYearSection;
}

let activeTOTDDetailPanel = null;
let activeTOTDDetail = "";
function ShowTOTDDetails(clickedElement)
{
    let newTOTDId = clickedElement.dataset.totdID;

    if(activeTOTDDetailPanel && activeTOTDDetail == newTOTDId)
    {
        CloseTOTDActivePanel();
        return;
    }

    if(activeTOTDDetailPanel)
    {
        CloseTOTDActivePanel();
    }

    let template = totdDetailsTemplate.content.cloneNode(true);
    let panel = template.querySelector('.track-details-panel');
    let totdData = GetTOTD(newTOTDId);

    let totdNumber = panel.querySelector('.totd-number-header');
    totdNumber.textContent = `Track of the Day #${totdData.totdIndex}`;

    let totdTitle = panel.querySelector('.track-title');
    totdTitle.textContent = totdData.totdName;

    let totdArtist = panel.querySelector('.track-artist');
    if(totdData.totdArtist == null || totdData.totdArtist == "")
    {
        totdArtist.remove();
    }
    else
    {
        totdArtist.textContent = totdData.totdArtist;
    }

    let totdAlbum = panel.querySelector('.track-album');
    if(totdData.totdAlbum == null || totdData.totdAlbum == "")
    {
        totdAlbum.remove();
    }
    else
    {
        if(totdData.totdAlbumNumber == null || totdData.totdAlbumNumber == "")
        {
            totdAlbum.innerHTML = `${totdData.totdAlbum}`;
        }
        else
        {
            if(totdData.totdAlbumDisc == null || totdData.totdAlbumDisc == "")
            {
                totdAlbum.innerHTML = `${totdData.totdAlbum} — Track #${totdData.totdAlbumNumber}`;
            }
            else
            {
                totdAlbum.innerHTML = `${totdData.totdAlbum} — Disc ${totdData.totdAlbumDisc}, Track #${totdData.totdAlbumNumber}`;
            }
        }
    }

    let totdReleaseDate = panel.querySelector('.release-date');
    totdReleaseDate.innerHTML = `Release Date: ${FormatDateToString(totdData.trackReleaseDate)}`;

    //Handling linked tracks
    let trackLinkDisplaying = false;
    if(totdData.linkedTracks == null || totdData.linkedTracks.length <= 0)
    {
        panel.querySelector('.linked-track-header').remove();
    }
    else
    {
        //Header setting
        let trackLinkedListHeader = panel.querySelector('.linked-track-header');
        trackLinkDisplaying = true;

        switch(totdData.musicType)
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
        totdData.linkedTracks.forEach((linkedTrack) => {
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
    if(totdData.extraNotes != null)
    {
        let addedNote = false;
        let noteList = panel.querySelector('.track-notes-list');

        totdData.extraNotes.forEach((note) => {
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

    //Handle original track artists
    if(totdData.totdArtists && totdData.totdArtists.length > 0)
    {
        let trackArtists = panel.querySelector('.track-info-list');
        totdData.totdArtists.forEach((artistData) => {
            let artistTemplate = totdInfoListTemplate.content.cloneNode(true);
            let artistText = artistTemplate.querySelector('.artist-info');
            artistText.innerHTML = `<strong>${artistData.header}:</strong> ${artistData.artistName}`;
            trackArtists.appendChild(artistTemplate);
        })
    }
    else
    {
        panel.querySelector('.track-info-list').remove();
    }

    if(trackLinkDisplaying && (!totdData.artists || totdData.artists.length <= 0))
    {
        panel.querySelector('.track-info-header').remove();
    }

    //Handling description
    if(totdData.description == null || totdData.description == "")
    {
        panel.querySelector('.track-description-title').remove();
        panel.querySelector('.track-description').remove();
    }
    else
    {
        let trackDescription = panel.querySelector('.track-description');
        trackDescription.innerHTML = ConvertToMarkdown(totdData.description);
    }

    //Insert onto page
    const nextInsertionPoint = GetEndOfRowElement(clickedElement, clickedElement.parentNode);
    if(nextInsertionPoint.nextSibling) {
        clickedElement.parentNode.insertBefore(panel, nextInsertionPoint.nextSibling);
    }
    else {
        clickedElement.parentNode.appendChild(panel);
    }

    setTimeout(() => {
        panel.classList.add('open');
    }, 10);

    activeTOTDDetailPanel = panel;
    activeTOTDDetail = newTOTDId;
}

function CloseTOTDActivePanel()
{
    if(!activeTOTDDetailPanel)
    {
        return;
    }

    let panelToClose = activeTOTDDetailPanel;
    panelToClose.classList.remove('open');

    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
    }, 300);

    activeTOTDDetailPanel = null;
    activeTOTDDetail = "";
}

function GetTOTD(id)
{
    for(let i = 0; i < totd.length; i++)
    {
        if(totd[i].totdID == id)
        {
            return totd[i];
        }
    }
}