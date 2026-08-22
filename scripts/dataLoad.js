async function LoadMusicData()
{
    let json = await LoadFromJSON('data/music.json');
    return json.music;
}

async function LoadPlatformsData()
{
    let json = await LoadFromJSON('data/platforms.json');
    return json.platforms;
}

async function LoadProjectsData()
{
    let json = await LoadFromJSON('data/projects.json');
    return json.projects;
}

async function LoadPlatformOrder()
{
    let json = await LoadFromJSON('data/platformOrder.json');
    return json.platformOrder;
}

async function LoadSeriesData()
{
    let json = await LoadFromJSON('data/series.json');
    return json.series;
}

async function LoadTimelineData()
{
    let json = await LoadFromJSON('data/timeline.json');
    return json.timeline;
}

async function LoadReviewData()
{
    let json = await LoadFromJSON('data/reviews.json');
    return json.reviews;
}

async function LoadFromJSON(jsonPath)
{
    let response = await fetch(jsonPath);

    if (!response.ok)
    {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    return response.json();
}

function GetProjectPicture(id)
{
    return "https://img.wally71551.workers.dev/projects/" + id + ".jpg";
}

function GetSeriesPicture(id)
{
    return "https://img.wally71551.workers.dev/series/" + id + ".jpg";
}

function GetPlatformPicture(id)
{
    return "https://img.wally71551.workers.dev/platforms/" + id + ".webp";
}

function GetMusicPicture(id)
{
    return "https://img.wally71551.workers.dev/music/" + id + ".jpg";
}

function GetReviewPicture(id)
{
    return "https://img.wally71551.workers.dev/review/" + id + ".jpg";
}