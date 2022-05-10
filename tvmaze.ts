import axios from "axios";
import * as $ from "jquery";
import { ShowsAPIInterface, EpisodesInterface, ShowsResponseInterface } from "./interfaces.js";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const TVMAZE_BASE_URL = "http://api.tvmaze.com";
const MISSING_IMG_URL = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowsResponseInterface[]> {
  const response = await axios.get(`${TVMAZE_BASE_URL}/search/shows`, {
    params: { q: term },
  });

  return response.data.map((result: { show: ShowsAPIInterface }): ShowsResponseInterface => {
      const show = result.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary || "No Summary",
        image: show.image?.medium || MISSING_IMG_URL,
      };
    }
  );
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowsResponseInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on(
  "submit",
  async function (evt: JQuery.SubmitEvent): Promise<void> {
    evt.preventDefault();
    await searchForShowAndDisplay();
  }
);

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodesInterface[]> {
  const episodes = await axios.get(`${TVMAZE_BASE_URL}/shows/${id}/episodes`);

  return episodes.data.map(
    (episode: EpisodesInterface) =>
      <EpisodesInterface>{
        id: id,
        name: episode.name,
        season: episode.season,
        number: episode.number,
      }
  );
}

/** Given an array of episodes, append them to the #episodesList DOM */

function populateEpisodes(episodes: EpisodesInterface[]): void {
  for (let episode of episodes) {
    const $li = $("<li>");

    $li.text(
      `${episode.name} (season ${episode.season}, number ${episode.number})`
    );
    $episodesList.append($li);
  }
}

/** Search for episode id and make the episode area visible */

async function searchForEpisodeAndDisplay(evt: JQuery.ClickEvent): Promise<void> {
  const $episode = $(evt.target.closest(".Show"));
  const episodeId = $episode.data().showId;
  const showOfEpisodes = await getEpisodesOfShow(episodeId);

  $episodesList.empty();
  populateEpisodes(showOfEpisodes);
  $episodesArea.show();
}

// Add event listener on the parent showList to listen for
// a click on the button

$showsList.on("click", ".Show-getEpisodes", (evt: JQuery.ClickEvent) => {
  searchForEpisodeAndDisplay(evt);
});
