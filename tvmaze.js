"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
  const shows = [];
  res.data.forEach(show => {
    if (show.show.image !== null) {
      shows.push({
        id : show.show.id,
        name : show.show.name,
        summary : show.show.summary,
        image : show.show.image
      })
    } if (show.show.image === null) {
      shows.push({
        id : show.show.id,
        name : show.show.name,
        summary : show.show.summary,
        image : { original : 'https://tinyurl.com/tv-missing' }
      })
    }
  })

return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

    for (let show of shows) {
     const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image.original}" 
              alt="Show Image." 
              class="card-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);
    
    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  // big bang theory id : 66
const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
const episodes = [];
res.data.forEach( episode => {
    episodes.push({
      id : episode.id,
      name : episode.name,
      season : episode.season,
      number : episode.number
    })
  })

return populateEpisodes(episodes);
/* use with modal functioning:
return createModal(episodes);
*/
}
/** Write a clear docstring for this function... */
//loop over episodes and create <li> ... </li> doc string to append to UL for episodes.
function populateEpisodes(episodes) { 
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`
    )
    /* used with modal when functioning
    $('#episodes-modal-list').append($episode);
    */
   $('#episodes-list').append($episode);
  }

  $episodesArea.show()
  
}
/* 
*** below function to be used with modal ***
function createModal(episodes) {
  const episodesArr = episodes;
  const modalBody = $(
    `<div class="modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Episodes</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ul id="episodes-modal-list">
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary">Save changes</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
    </div>`
  )

  $episodesArea.append(modalBody);
  populateEpisodes(episodesArr);
}

*/

//handle click for episodes button, return value for show id, pass value to getEpisodesOfShow();
$showsList.on('click', async function(e){
  e.preventDefault();
  //note to self: jQuery syntax allows $(...) around e.target allowing acces to jQuery methods
  const showId = $(e.target).parents('.Show').data().showId;
  getEpisodesOfShow(showId);
  //$(e.target).attr('data-toggle', 'modal').attr('data-target', '#modal')
})