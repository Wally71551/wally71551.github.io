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

async function LoadSeriesData()
{
    let json = await LoadFromJSON('data/series.json');
    return json.series;
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