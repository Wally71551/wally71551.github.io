let music;
let projects;
let musicGrid;

const musicTemplate = document.getElementById("music-grid");
const musicDetailsTemplate = document.getElementById("track-details");

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

function ShowMusicDetails(clickedElement)
{
    let musicID = clickedElement.dataset.musicID;
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