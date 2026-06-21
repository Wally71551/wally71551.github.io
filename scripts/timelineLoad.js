let timeline;
let currentTimelineYear;
let currentTimelineSection;
let currentTimelineGrid;
let timelineContainer;
let previousDate;

const timelineYearTemplate = document.getElementById("timeline-year-template");
const timelineDateTemplate = document.getElementById("timeline-date-template");
const timelineEntryTemplate = document.getElementById("timeline-entry-template");

Init();

async function Init()
{
    timeline = await LoadTimelineData();
    currentTimelineYear = -1;

    PageLoad();
}

function PageLoad()
{
    timelineContainer = document.getElementsByClassName("timeline-container")[0];
    timeline.forEach(AddEntry);
}

function AddEntry(entry, index)
{
    //Check for new timeline year
    let date = entry.entryDate.split('-');
    let year = date[0];
    if(year > currentTimelineYear)
    {
        currentTimelineSection = CreateNewSection(year);
    }

    let timelineDateObject = timelineDateTemplate.content.cloneNode(true);
    let timelineDateDisplay = timelineDateObject.querySelector('.timeline-date');
    currentDate = date[2] + "/" + date[1];
    timelineDateDisplay.innerText = currentDate;

    if(currentTimelineGrid.firstChild != null && currentTimelineGrid.firstElementChild.innerText == currentDate)
    {
        currentTimelineGrid.firstElementChild.innerText = "";
    }

    let timelineEntryObject = timelineEntryTemplate.content.cloneNode(true);
    let timelineEntryDisplay = timelineEntryObject.querySelector('.timeline-entry-text');
    timelineEntryDisplay.innerHTML = entry.entryText;

    if(entry.entryURL != null && entry.entryURL != "")
    {
        let timelineLinkDisplay = timelineEntryObject.querySelector('.timeline-entry-link');
        timelineLinkDisplay.href = entry.entryURL;
        let timelineLinkImage = timelineLinkDisplay.querySelector('.timeline-link-image');
        timelineLinkImage.src = "icons/" + entry.entryURLImage + ".svg";
    }
    else
    {
        timelineEntryObject.querySelector('.timeline-entry-link').remove();
    }

    currentTimelineGrid.insertBefore(timelineEntryObject, currentTimelineGrid.firstChild);
    currentTimelineGrid.insertBefore(timelineDateObject, currentTimelineGrid.firstChild);
}

function CreateNewSection(year)
{
    currentTimelineYear = year;
    let newTimelineSection = timelineYearTemplate.content.cloneNode(true);
    currentTimelineSection = newTimelineSection.object;
    timelineYearHeader = newTimelineSection.querySelector('.timeline-year-heading');
    timelineYearHeader.innerText = year;
    currentTimelineGrid = newTimelineSection.querySelector('.timeline-grid');

    timelineContainer.insertBefore(newTimelineSection, timelineContainer.firstChild);
    return newTimelineSection;
}