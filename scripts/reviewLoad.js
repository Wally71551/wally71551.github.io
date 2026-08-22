let reviews;

let reviewGrid;

const reviewTemplate = document.getElementById("review-grid");
const reviewDetailsTemplate = document.getElementById("review-details");
const reviewCreatorListTemplate = document.getElementById("review-info-list-item");
const reviewSectionListTemplate = document.getElementById("review-section-list-item");

Init();

async function Init()
{
    reviews = await LoadReviewData();
    PageLoad();
}

function PageLoad()
{
    reviewGrid = document.querySelector('.review-content-grid');
    reviews.sort((a, b) => b.reviewDate.localeCompare(a.reviewDate));
    reviews.forEach(ReviewSetup);
}

function ReviewSetup(reviewData, index)
{
    let reviewElement = reviewTemplate.content.cloneNode(true);

    let reviewNum = reviewElement.querySelector('.review-number');
    reviewNum.textContent = '#' + reviewData.reviewIndex;

    let image = reviewElement.querySelector('img');
    image.src = GetReviewPicture(reviewData.reviewImageURL);

    let title = reviewElement.querySelector('.project-title');
    title.textContent = reviewData.reviewName;

    let subtitle = reviewElement.querySelector('.project-subtitle');
    if(reviewData.reviewSubtitle == null || reviewData.reviewSubtitle == "")
    {
        subtitle.remove();
    }
    else
    {
        subtitle.textContent = reviewData.reviewSubtitle;
    }

    let gridItemDiv = reviewElement.querySelector('.grid-item');
    gridItemDiv.dataset.reviewID = reviewData.reviewID;
    gridItemDiv.addEventListener('click', (e) => {
        ShowReviewDetails(gridItemDiv);
    });

    reviewGrid.append(reviewElement);
}

let activeReviewPanel = null;
let activeReviewID = "";
function ShowReviewDetails(clickedElement)
{
    let newReviewID = clickedElement.dataset.reviewID;

    if(activeReviewPanel && activeReviewID === newReviewID)
    {
        CloseReviewActivePanel();
        return;
    }

    if(activeReviewPanel)
    {
        CloseReviewActivePanel();
    }

    //Populate with needed info
    let template = reviewDetailsTemplate.content.cloneNode(true);
    let panel = template.querySelector('.project-details-panel');
    let reviewData = GetReview(newReviewID);

    let reviewTitle = panel.querySelector('.review-title');
    reviewTitle.textContent = reviewData.reviewName;

    if(reviewData.reviewSubtitle != null && reviewData.reviewSubtitle != "")
    {
        let reviewSubtitle = panel.querySelector('.review-subtitle');
        reviewSubtitle.textContent = reviewData.reviewSubtitle;
    }
    else
    {
        panel.querySelector('.review-subtitle').remove();
    }

    //platform
    if(reviewData.reviewPlatform != null && reviewData.reviewPlatform != "")
    {
        let reviewPlatform = panel.querySelector('.review-platform');
        reviewPlatform.textContent = reviewData.reviewPlatform;
    }
    else
    {
        panel.querySelector('.review-platform').remove();
    }

    let categoryText = panel.querySelector('.review-category');
    categoryText.textContent = reviewData.reviewCategory;

    let reviewDate = panel.querySelector('.release-date');
    reviewDate.innerHTML = `Review Date: ${FormatDateToString(reviewData.reviewDate)}`;

    //Handle creators
    if(reviewData.creators && reviewData.creators.length > 0)
    {
        let reviewCreators = panel.querySelector('.review-info-list');
        reviewData.creators.forEach((creatorData) => {
            let creatorTemplate = reviewCreatorListTemplate.content.cloneNode(true);
            let creatorText = creatorTemplate.querySelector('.artist-info');
            creatorText.innerHTML = `<strong>${creatorData.header}:</strong> ${creatorData.creatorName}`;
            reviewCreators.appendChild(creatorTemplate);
        });
    }
    else
    {
        panel.querySelector('.review-info-list').remove();
    }

    //Categories
    if(reviewData.reviewSections && reviewData.reviewSections.length > 0)
    {
        let sectionsList = panel.querySelector('.review-sections-list');
        reviewData.reviewSections.forEach((sectionData) => {
            let sectionTemplate = reviewSectionListTemplate.content.cloneNode(true);
            let sectionText = sectionTemplate.querySelector('.review-section-text');
            sectionText.innerHTML = sectionData.section;
            let sectionNumber = sectionTemplate.querySelector('.review-section-rating');
            sectionNumber.innerHTML = sectionData.number;
            sectionsList.appendChild(sectionTemplate);
        });
    }
    else
    {
        panel.querySelector('.review-sections-list').remove();
    }

    let reviewRating = panel.querySelector('.review-rating');
    reviewRating.innerHTML = reviewData.reviewValue;
    let reviewCircle = panel.querySelector('.review-rating-display');
    reviewCircle.style.setProperty('--rating', reviewData.reviewValue);

    //Details
    if(reviewData.reviewDetails == null || reviewData.reviewDetails == "")
    {
        panel.querySelector('.review-details').remove();
    }
    else
    {
        let reviewDetails = panel.querySelector('.review-details');
        reviewDetails.innerHTML = ConvertToMarkdown(reviewData.reviewDetails);
    }

    //Insert onto page
    const nextInsertionPoint = GetEndOfRowElement(clickedElement, reviewGrid);
    if(nextInsertionPoint.nextSibling) {
        reviewGrid.insertBefore(panel, nextInsertionPoint.nextSibling);
    }
    else {
        reviewGrid.appendChild(panel);
    }

    setTimeout(() => {
        panel.classList.add('open');
    }, 10);

    activeReviewPanel = panel;
    activeReviewID = newReviewID;
}

function CloseReviewActivePanel()
{
    if(!activeReviewPanel)
    {
        return;
    }

    let panelToClose = activeReviewPanel;
    panelToClose.classList.remove('open');

    setTimeout(() => {
        if(panelToClose.parentNode)
        {
            panelToClose.remove();
        }
    }, 300);

    activeReviewPanel = null;
    activeReviewID = "";
}

function GetReview(id)
{
    for(let i = 0; i < reviews.length; i++)
    {
        if(reviews[i].reviewID == id)
        {
            return reviews[i];
        }
    }
}