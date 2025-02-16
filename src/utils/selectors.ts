export const matchSelectors = {
  root: '.wf-module-item.match-item',
  status: '.ml-status',
  team: {
    root: '.match-item-vs-team',
    country: '.flag',
    name: '.match-item-vs-team-name',
    score: '.match-item-vs-team-score',
  },
  tournament: {
    name: '.match-item-event',
    event: '.match-item-event-series',
    img: '.match-item-icon img',
  },
  time: '.match-item-time',
};

export const eventSelectors = {
  root: {
    all: '.events-container-col .event-item',
    upcoming: '.events-container-col:has(.mod-upcoming) .event-item',
    completed: '.events-container-col:has(.mod-completed) .event-item',
  },
  name: '.event-item-title',
  status: '.event-item-desc-item-status',
  prizePool: '.mod-prize',
  dates: '.mod-dates',
  country: {
    name: '.flag',
  },
  img: '.event-item-thumb img'
};
