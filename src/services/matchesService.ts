import { getTime, isSameDay } from 'date-fns';
import { parse } from 'node-html-parser';

import { matchSelectors } from '../utils/selectors';

export async function getMatches(date: string) {
  const [past, future] = await Promise.all([
    parseMatches(date, 'past'),
    parseMatches(date, 'future'),
  ]);
  return [...past.reverse(), ...future];
}

async function parseMatches(date: string, status: 'past' | 'future') {
  const url =
    process.env.VLR_URL + '/matches' + (status === 'past' ? '/results' : '');

  const res = await fetch(url);
  const html = await res.text();
  const root = parse(html);
  return root
    .querySelectorAll(matchSelectors.root)
    .filter((matchItem) =>
      isSameDay(
        date,
        matchItem.parentNode.previousElementSibling?.firstChild?.text.trim() ||
          ''
      )
    )
    .map((matchItem) => {
      const status = matchItem
        .querySelector(matchSelectors.status)
        ?.text.trim()
        .toLowerCase();

      const url = matchItem
        .querySelector(matchSelectors.tournament.img)
        ?.getAttribute('src');

      return {
        id: matchItem.getAttribute('href')?.split('/')[1],
        status,
        tournament: {
          name: matchItem
            .querySelector(matchSelectors.tournament.root)
            ?.lastChild?.text.trim(),
          event: matchItem
            .querySelector(matchSelectors.tournament.event)
            ?.text.trim(),
          img: url?.includes('owlcdn')
            ? process.env.VLR_URL + url
            : 'https:' + url,
        },
        teams: matchItem
          .querySelectorAll(matchSelectors.team.root)
          .map((team) => {
            const countryName = team
              .querySelector(matchSelectors.team.country)
              ?.classNames.split('-')[1];
            const countryImg = `https://www.vlr.gg/img/icons/flags/16/${countryName}.png`;
            const country = { name: countryName, img: countryImg };

            return {
              name: team.querySelector(matchSelectors.team.name)?.text.trim(),
              country,
              score:
                status === 'live' || status === 'completed'
                  ? team.querySelector(matchSelectors.team.score)?.text.trim()
                  : undefined,
            };
          }),
        timestamp: getTime(
          date + ' ' + matchItem.querySelector(matchSelectors.time)?.text.trim()
        ),
      };
    });
}
