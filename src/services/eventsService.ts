import { parse } from 'node-html-parser';
import { eventSelectors } from '../utils/selectors';

export async function getEvents(status: string, region: string, page: number) {
  const url = `${process.env.VLR_URL}/events/${region}?page=${page}`;
  const res = await fetch(url);
  const html = await res.text();

  let rootSelector;

  switch (status) {
    case 'completed':
      rootSelector = eventSelectors.root.completed;
      break;
    case 'ongoing':
    case 'upcoming':
      rootSelector = eventSelectors.root.upcoming;
      break;
    default:
      rootSelector = eventSelectors.root.all;
  }

  return parse(html)
    .querySelectorAll(rootSelector)
    .map((eventItem) => {
      const dates = eventItem
        .querySelector(eventSelectors.dates)
        ?.firstChild?.text.trim()
        .split('—');

      const countryName = eventItem
        .querySelector(eventSelectors.country.name)
        ?.classNames.split('-')[1];
      const countryImg = `https://www.vlr.gg/img/icons/flags/16/${countryName}.png`;

      const url = eventItem
        .querySelector(eventSelectors.img)
        ?.getAttribute('src');

      return {
        id: eventItem.getAttribute('href')?.split('/')[2],
        name: eventItem.querySelector(eventSelectors.name)?.text.trim(),
        status: eventItem.querySelector(eventSelectors.status)?.text.trim(),
        prizePool: eventItem
          .querySelector(eventSelectors.prizePool)
          ?.firstChild?.text.trim(),
        dates: {
          start: dates ? dates[0] : null,
          end: dates ? dates[1] : null,
        },
        country: {
          name: countryName,
          img: countryImg,
        },
        img: url?.includes('vlr') ? process.env.VLR_URL + url : 'https:' + url,
      };
    });
}
