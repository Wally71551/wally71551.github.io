let totd;
let currentTOTDYear;
let currentTOTDSection;
let currentTOTDGrid;
let previousDate;

const totdYearTemplate = document.getElementById("totd-year");
const totdTemplate = document.getElementById("totd-grid");

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