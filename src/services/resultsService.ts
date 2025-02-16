import { fromURL } from 'cheerio';

export async function getResults(page: number) {
  const $ = await fromURL(
    `${process.env.VLR_URL}/matches/results?page=${page}`
  );
  const results = [];

  try {
    $('.wf-module-item.match-item').each((index, element) => {
      const match: any = {
        id: $(element).attr('href').split('/')[1],
        teams: [],
        status: $(element).find('.ml-status').text().trim(),
        ago: $(element).find('.ml-eta').text().trim(),
        event: $(element)
          .find('.match-item-event-series.text-of')
          .text()
          .trim(),
        tournament: $(element)
          .find('.match-item-event.text-of')
          .contents()
          .last()
          .text()
          .trim(),
        img: $(element)
          .find('.match-item-icon img')
          .attr('src')
          .includes('/img/vlr')
          ? process.env.VLR_URL +
            $(element).find('.match-item-icon img').attr('src')
          : 'https:' + $(element).find('.match-item-icon img').attr('src'),
      };

      $(element)
        .find('.match-item-vs-team')
        .each((index, teamElement) => {
          const team: any = {
            name: $(teamElement).find('.text-of').text().trim(),
            score: $(teamElement)
              .find('.match-item-vs-team-score.js-spoiler')
              .text()
              .trim(),
            country: $(teamElement)
              .find('.flag')
              .attr('class')
              .split(' ')[1]
              .replace('mod-', ''),
          };
          team.countryFlag = `https://www.vlr.gg/img/icons/flags/16/${team.country}.png`;
          match.teams.push(team);
        });

      const winningScore = Math.max(
        ...match.teams.map((team: any) => team.score)
      );
      match.teams.forEach((team: any) => {
        team.won = team.score == winningScore;
      });

      const parent = $(element.parent);
      const dateContainer = parent.prev();
      const date = dateContainer
        .text()
        .trim()
        .replace('Today', '')
        .replace('Yesterday', '');
      const time = $(element).find('.match-item-time').text().trim();
      const dateAndTime = date + ' ' + time;
      const newDate = new Date(dateAndTime);

      match.timestamp = Math.floor(newDate.getTime() / 1000);
      match.utcDate = newDate.toUTCString();
      match.utc = newDate;

      results.push(match);
    });

    return {
      size: results.length,
      results,
    };
  } catch (error) {
    console.log(error);
    return { size: 0, results: [] };
  }
}
