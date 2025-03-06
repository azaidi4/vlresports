import { getTime, isSameDay } from 'date-fns';
import { parse } from 'node-html-parser';

import { matchSelectors } from '../utils/selectors';

export async function getMatches(date: string) {
  const [past, future] = await Promise.all([
    parseMatches(date, 'past'),
    parseMatches(date, 'future'),
  ]);

  const merged = { ...past };

  Object.keys(future).forEach((key) => {
    merged[key] = merged[key] ? merged[key].concat(future[key]) : future[key];
  });

  return merged;
}

async function parseMatches(date: string, status: 'past' | 'future') {
  const url =
    process.env.VLR_URL + '/matches' + (status === 'past' ? '/results' : '');

  const res = await fetch(url);
  const html = await res.text();

  const matchesOnDate = parse(html)
    .querySelectorAll(matchSelectors.root)
    .filter((matchItem) =>
      isSameDay(
        date,
        matchItem.parentNode.previousElementSibling?.firstChild?.rawText.trim() ||
          ''
      )
    );

  const matchesMap: Record<string, object[]> = {};
  for (
    let i = status === 'past' ? matchesOnDate.length - 1 : 0;
    status === 'past' ? i >= 0 : i < matchesOnDate.length;
    status === 'past' ? i-- : i++
  ) {
    const matchItem = matchesOnDate[i];

    const tournamentName =
      matchItem
        .querySelector(matchSelectors.tournament.name)
        ?.lastChild?.rawText.trim() || '';

    if (!matchesMap[tournamentName]) {
      matchesMap[tournamentName] = [];
    }

    const status = matchItem
      .querySelector(matchSelectors.status)
      ?.rawText.trim()
      .toLowerCase();

    const tournamentImgUrl = matchItem
      .querySelector(matchSelectors.tournament.img)
      ?.getAttribute('src');

    matchesMap[tournamentName].push({
      id: matchItem.getAttribute('href')?.split('/')[1],
      status,
      tournament: {
        name:
          matchItem
            .querySelector(matchSelectors.tournament.name)
            ?.lastChild?.rawText.trim() || '',
        event: matchItem
          .querySelector(matchSelectors.tournament.event)
          ?.rawText.trim(),
        img: tournamentImgUrl?.includes('vlr')
          ? process.env.VLR_URL + tournamentImgUrl
          : 'https:' + tournamentImgUrl,
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
            name: team.querySelector(matchSelectors.team.name)?.rawText.trim(),
            country,
            score:
              status === 'live' || status === 'completed'
                ? team.querySelector(matchSelectors.team.score)?.rawText.trim()
                : undefined,
          };
        }),
      timestamp: getTime(
        date + ' ' + matchItem.querySelector(matchSelectors.time)?.rawText.trim()
      ),
    });
  }
  return matchesMap;
}
