/** @format */

const a = {
	data: {},
	layers: {},
	censusUrl: 'https://api.census.gov/data/2020/acs/acs5/profile?get=NAME,DP03_0099PE&for=county:*&in=state:35',
	censusVar: '% of New Mexicans without health insurance',
	geojsons: {
		counties: 'https://newmapsplus.github.io/assets/data/census2020/us-counties-100m.json',
	},
	map: {
		div: 'map',
		options: {
			zoomSnap: 1,
			zoomControl: false,
		},
		tooltip: function (name, a) {
			const tooltipInfo = `<b>${name} County </b></br>
			${a}% of ${name} County residents don't have health insurance.`;
			return tooltipInfo;
		},
		styles: {
			default: {
				color: '#20282e',
				weight: 2,
				fillOpacity: 1,
				fillColor: '#1f78b4',
			},
			mouseover: {
				color: '#ff6e00',
			},
			mouseout: {
				color: '#20282e',
			},
		},
		fitOptions: {
			padding: [20, 20],
			animate: false,
		},
		zoomOptions: {
			position: 'bottomright',
		},
	},
	tiles: {
		url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
		options: {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		},
	},
	buttons: {
		dropdown: {
			id: 'dropdown-ui',
			select: '#dropdown-ui select',
			options: {
				position: 'topright',
			},
		},
		locate: {
			id: '#geolocate-ui',
		},
	},
	legend: {
		div: 'legend',
		colors: {
			5: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
			7: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
		},
		makePercent: function (a, b, color) {
			const classLabel = `<div><span style ="background: ${color}"></span>
                                <label>${a} &mdash;
                                ${b}%</label></div>`;
			return classLabel;
		},
		options: {
			position: 'topleft',
		},
		getColor: function (d, breaks, classes) {
			const colors = a.legend.colors[classes];
			for (let i = 0; i < classes; i++) {
				if (d <= breaks[i][1]) {
					return colors[i];
				}
			}
		},
	},
	classes: {
		number: 5,
	},
};
