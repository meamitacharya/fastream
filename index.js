document.addEventListener("DOMContentLoaded", initialize);

const renderFixtureForDay = (fixtures) => {
	let allFixtures = ``;
	fixtures.forEach(fixture => allFixtures += renderIndividualFixture(fixture));
	return allFixtures;
}

const renderIndividualFixture = ({ homeTeamName, awayTeamName, status, date, _links }) => {
	if (status === 'FINISHED') return '';
	return `
	<tr class="e_row">
	<td width="20">

		<img width="50" title="${getCompetitionData(_links).title}" src="${getCompetitionData(_links).logo}">

	</td>
	<td width="80">

		<span data-time="1514403900" class="time">${moment.utc(date).local().format('hh:mm A')}</span>
	</td>
	<td width="20">
		<img width="50" src=${getTeamLogo(_links, 'homeTeam')}>
	</td>
	<td align="left" width="250">${homeTeamName}</td>
	<td width="60" align="center">vs</td>
	<td align="right" width="250">${awayTeamName}</td>
	<td width="20">
		<img width="50" src=${getTeamLogo(_links, 'awayTeam')}>
	</td>
	<td width="20">
		${getLinkButton(homeTeamName, awayTeamName)}
	</td>
</tr>`
}

const getFixtureDate = (local_date) => {
	const current_local_date = moment().local(),
		isToday = local_date.endOf('day').isSame(current_local_date.endOf('day')),
		isTomorrow = local_date.endOf('day').isSame(current_local_date.add(1, 'day').endOf('day'));
	return isToday ? 'Today' : isTomorrow ? 'Tomorrow' : local_date.format('DD MMMM YYYY');
}

const getTeamLogo = (links, key) => {
	const link = links[key].href,
		splitted_link = link.split('/');
	return `/images/teams/${splitted_link[splitted_link.length - 1]}.png`;
}

const getCompetitionData = (links) => {
	const link = links.competition.href,
		titles = { '445': 'PL', '464': 'CL' },
		splitted_link = link.split('/'),
		competition_id = splitted_link[splitted_link.length - 1];
	return {
		logo: `/images/competitions/${competition_id}.png`,
		title: titles[competition_id]
	}
}

getLinkButton = (homeTeamName, awayTeamName) => {
	homeTeamName = homeTeamName.toLowerCase().trim().replace(/\s/g, '');
	awayTeamName = awayTeamName.toLowerCase().trim().replace(/\s/g, '');
	const channel = live_channels[`445_${homeTeamName}_${awayTeamName}`];
	if (channel && channel[0]) {
		return `<a class="btn btn-success btn-xs" href="/live/${channel[0]}.html" >Watch</a>`
	}
	return `<button class="btn btn-success btn-xs" disabled>Watch</button>`
}

async function getDataFromUrl(url) {
	url = new URL(url),
		params = {
			"timeFrameStart": moment.utc().format('YYYY-MM-DD'),
			"timeFrameEnd": moment.utc().add(14, 'days').endOf('day').format('YYYY-MM-DD')
		}
	Object.keys(params).forEach(key => {
		url.searchParams.append(key, params[key]);
	})
	const data = await fetch(url, {
		method: 'GET',
		body: JSON.stringify(),
		headers: new Headers({
			'X-Auth-Token': 'd186a2c2d65449898f50c4d9bcbf50c4'
		})
	});
	return data.json();
}

async function initialize() {
	const /*ll_data = await getDataFromUrl('http://api.football-data.org/v1/competitions/455/fixtures'),*/
		pl_data = await getDataFromUrl('http://api.football-data.org/v1/competitions/445/fixtures'),
		cl_data = await getDataFromUrl('http://api.football-data.org/v1/competitions/464/fixtures'),
		all_fixtures = [/*...ll_data.fixtures*/, ...pl_data.fixtures, ...cl_data.fixtures];
	let modified_data = {}, fixturesContent = '';
	//console.log(cl_data.fixtures);
	all_fixtures.forEach((fixture) => {
		const local_date = moment.utc(fixture.date).local(),
			date_only = getFixtureDate(local_date);
		if (modified_data[date_only]) {
			modified_data[date_only].push(fixture);
		} else {
			modified_data[date_only] = [fixture];
		}
	});
	for (date in modified_data) {
		const fixtureForDay = renderFixtureForDay(modified_data[date]);
		if (fixtureForDay !== '') {
			fixturesContent += `<tr><td class="date-row" colspan="8">${date} </td></tr>`;
			fixturesContent += fixtureForDay;
		}
	}
	document.querySelector('#fixture-loading').style.display = 'none';
	document.querySelector('#fixture-table tbody').innerHTML = fixturesContent;
	document.querySelector('#footer').innerHTML = `<footer class="footer bg-dark">
		<span>Fastream &copy; 2018 | Mail:contact@fastream.live</span>
	</footer>`;
}