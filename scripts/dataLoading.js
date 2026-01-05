async function LoadMusicData() {
    let json = await LoadFromJSON('data/music.json');
    return json.music;
}

async function LoadPlatformsData() {
    return await LoadFromJSON('data/platforms.json');
}

async function LoadProjectsData() {
    return await LoadFromJSON('data/projects.json').projects;
}

async function LoadSeriesData() {
    return await LoadFromJSON('data/series.json');
}

async function LoadFromJSON(jsonPath) {
    let response = await fetch(jsonPath);

    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    return response.json();
}