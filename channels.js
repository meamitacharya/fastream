document.addEventListener("DOMContentLoaded", function (event) {
	let active_key, channelName;
	for (key in live_channels) {
		channelName = live_channels[key].find((channel) => {
			if (document.getElementById(channel)) {
				active_key = key;
				return true;
			}
		});
		if (channelName) {
			break;
		}
	}
	document.getElementById(channelName).innerHTML = getLinks(active_key, channelName);
});

const getLinks = (active_key, channelName) => {
	const links = live_channels[active_key];
	let link_elements = ``;
	links.forEach(function (element, index) {
		if (element !== channelName) {
			link_elements += `<a class="button" href="/live/${element}.html" target="_blank">Link ${index + 1}</a>`
		}
	});
	return link_elements;
}