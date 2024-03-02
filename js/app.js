/** @format */

(function () {
	// start with this self-invoking function expression that contains all variables - this manages the scope of the JS

	'use strict'; // tells JS to use the strict interpretation and to throw an errors when needed

	//* ######################## Screen Size ##############################
	adjustHeight(); // call the below function
	window.addEventListener('resize', adjustHeight); // For mobile devices: this "listens" for smaller screens and calls the function again with the smaller size

	// ------------------------- adjustHeight Function --------------------
	function adjustHeight() {
		const mapSize = document.querySelector('#map'),
			contentSize = document.querySelector('#content'),
			removeHeight = document.querySelector('#footer').offsetHeight,
			resize = window.innerHeight - removeHeight; // equation to set screen resize ratio

		mapSize.style.height = '${resize}px'; // telling leaflet to display the map based on the equation above

		if (window.innerWidth >= 768) {
			// if viewing on large screens run the code above
			contentSize.style.height = `${resize}px`;
			mapSize.style.height = `${resize}px`;
		} else {
			// if viewing on a small screens reduce the content by 25% and the map size by 75%
			contentSize.style.height = `${resize * 0.25}px`;
			mapSize.style.height = `${resize * 0.75}px`;
		}
	}

	// ####################### Button ###################################
	// Control the button that shows the legend when the screen is smaller than 768px
	const button = document.querySelector('#legend button');
	button.addEventListener('click', function () {
		// listens for a "click" and changes to the style below
		const legend = document.querySelector('.leaflet-legend');
		legend.classList.toggle('show-legend'); // this in-line style will override other css after the click
	});

	//! go to mapbox and create a base map (instructions in lesson)
	//* ########################### Map ################################

	var map = L.map('map', {
		zoomSnap: 0.1,
		// zoom: 6.5, // i removed this because the .fitBounds method in the drawMap function sets the zoom
		center: [-0.23, 37.8],
		zoomControl: false,
		// minZoom: 6,
		// maxZoom: 9,
		maxBounds: L.latLngBounds([-6.22, 27.72], [5.76, 47.83]),
	});

	// mapbox access Token: pk.eyJ1IjoibmF0aGFuZGVyIiwiYSI6ImNsczFwdHFrajAzNzAybWw4YW5rcTg3aGUifQ.-BTDYHz11uonSeUb85Es9g
	// mapbox style url: mapbox://styles/nathander/cls7gfn3m02dz01p11zrv34ac
	// mapbox "preview only" link: https://api.mapbox.com/styles/v1/nathander/cls7gfn3m02dz01p11zrv34ac.html?title=view&access_token=pk.eyJ1IjoibmF0aGFuZGVyIiwiYSI6ImNsczFwdHFrajAzNzAybWw4YW5rcTg3aGUifQ.-BTDYHz11uonSeUb85Es9g&zoomwheel=true&fresh=true#5.59/0.123/37.916
	// constructed URL: https://api.mapbox.com/styles/v1/nathander/cls7gfn3m02dz01p11zrv34ac/tiles/512/{x}/{y}?access_token=pk.eyJ1IjoibmF0aGFuZGVyIiwiYSI6ImNsczFwdHFrajAzNzAybWw4YW5rcTg3aGUifQ.-BTDYHz11uonSeUb85Es9g

	// ----------- using variables to create the "constructed" url written out above --------------------
	const accessToken = 'pk.eyJ1IjoibmF0aGFuZGVyIiwiYSI6ImNsczFwdHFrajAzNzAybWw4YW5rcTg3aGUifQ.-BTDYHz11uonSeUb85Es9g';
	const yourName = 'nathander';
	const yourMap = 'cls7gfn3m02dz01p11zrv34ac';
	// request a mapbox raster tile layer and add to map
	L.tileLayer(`https://api.mapbox.com/styles/v1/${yourName}/${yourMap}/tiles/256/{z}/{x}/{y}?access_token=${accessToken}`, {
		attriburtion: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
	}).addTo(map);

	//* ############################# Data #################################
	// omnivore.csv("data/kenya_education_2014.csv").addTo(map); // omnivore converts the csv to a geojson so the points are mapped
	//! the line of code above plots the data with standard markers - I don't need this since I added the data below with circle markers
	omnivore
		.csv('data/kenya_education_2014.csv')
		.on('ready', function (e) {
			// access to the GeoJSON goes here
			drawMap(e.target.toGeoJSON());
			drawLegend(e.target.toGeoJSON());
			// console.log(e.target);
			// all data is loaded into layer
		})
		.on('error', function (e) {
			console.log(e.error[0].message); //? is there an error message?  NO
			// error message fired if the layer can't be loaded over AJAX or can't be parsed
		});

	//* ------------------------ drawMap Function --------------------------
	function drawMap(data) {
		// access to data goes here
		// console.log(data); //? is the data in the log?  YES
		const options = {
			pointToLayer: function (feature, ll) {
				// Circle markers with default settings
				return L.circleMarker(ll, {
					opacity: 1,
					weight: 2,
					fillOpacity: 0,
				});
			},
		};

		//* create 2 separate layers from the GeoJSON data ===========
		const girlsLayer = L.geoJson(data, options).addTo(map), // girls circle
			boysLayer = L.geoJson(data, options).addTo(map); // boys circle

		// fit the bounds of the map to one of the layers (because they are both the same size - we only need to do this to one)
		map.fitBounds(girlsLayer.getBounds(), {
			padding: [100, 100], //? should I remove the zoom level since this sets it?
		});

		girlsLayer.setStyle({
			color: getColor('girls'),
		});
		boysLayer.setStyle({
			color: getColor('boys'),
		});

		resizeCircles(girlsLayer, boysLayer, 1);
		sequenceUI(girlsLayer, boysLayer);
	}

	//* ----------------------- getColor(x) Function ------------------------
	function getColor(x) {
		// Access the fourth stylesheet referenced in the HTML head element
		const stylesheet = document.styleSheets[3];
		const colors = [];

		// Check out the rules in the stylesheet
		// console.log(stylesheet.cssRules);

		// Loop through the rules in the stylesheet
		for (let i of stylesheet.cssRules) {
			// When we find girls, add it's color to an array
			if (i.selectorText === '.girls') {
				colors[0] = i.style.backgroundColor;
			}
			if (i.selectorText === '.boys') {
				colors[1] = i.style.backgroundColor;
			}
		}

		// If function was given 'girls' return that color
		if (x == 'girls') {
			return colors[0];
		} else {
			return colors[1];
		}
	}
	//* ----------------------- calcRadius(val) Function --------------------
	function calcRadius(val) {
		const radius = Math.sqrt(val / Math.PI); // equation to define the radius of each circle
		return radius * 0.5; // return the value from line above multiplied by half to adjust the scale
	}

	//* ----------------------- resizeCircles Functions ---------------------
	function resizeCircles(girlsLayer, boysLayer, currentGrade) {
		girlsLayer.eachLayer(function (layer) {
			const radius = calcRadius(Number(layer.feature.properties['G' + currentGrade]));
			layer.setRadius(radius);
		});
		boysLayer.eachLayer(function (layer) {
			const radius = calcRadius(Number(layer.feature.properties['B' + currentGrade]));
			layer.setRadius(radius);
		});

		retrieveInfo(boysLayer, currentGrade);
	}

	//* ########################## Legend #################################

	//* ------------------------------ drawLegend Function -----------------------
	//! call in the Omnivore callback function
	function drawLegend(data) {
		const legendControl = L.control({
			// create leaflet control for the legend
			position: 'bottomright',
		});

		// add Leaflet control to the legend
		legendControl.onAdd = function () {
			const legend = L.DomUtil.get('legend'); // select the "legend"

			L.DomEvent.disableScrollPropagation(legend); // disable scroll
			L.DomEvent.disableClickPropagation(legend); // disable click

			return legend; // return "legend"
		};

		legendControl.addTo(map); // add the legend to the map

		//* empty array to hold values ====================
		const dataValues = [];

		// loop through all features (i.e., the schools)
		data.features.forEach(function (school) {
			// for each grade in a school
			for (let grade in school.properties) {
				// shorthand to each value
				const value = school.properties[grade];
				// if the value can be converted to a number
				// the + operator in front of a number returns a number
				if (+value) {
					//return the value to the array
					dataValues.push(+value);
				}
			}
		});
		// verify your results!
		console.log(dataValues);

		//* sort the array =======================
		const sortedValues = dataValues.sort(function (a, b) {
			return b - a;
		});

		//* round the highest number ================
		const maxValue = Math.round(sortedValues[0] / 1000) * 1000; // round to the highest number and use as our large circle diameter
		// console.log(sortedValues);

		//* calc the diameters ====================
		const largeDiameter = calcRadius(maxValue) * 2,
			smallDiameter = largeDiameter / 2;
		console.log(largeDiameter, smallDiameter);

		//* create a function with a short name to select elements =============
		const $ = function (x) {
			return document.querySelector(x);
		};

		// select our circles container and set the height
		$('.legend-circles').style.height = `${largeDiameter.toFixed()}px`;

		// set width and height for large circle
		$('.legend-large').style.width = `${largeDiameter.toFixed()}px`;
		$('.legend-large').style.height = `${largeDiameter.toFixed()}px`;

		// set width and height for small circle and position
		$('.legend-small').style.width = `${smallDiameter.toFixed()}px`;
		$('.legend-small').style.height = `${smallDiameter.toFixed()}px`;
		$('.legend-small').style.top = `${largeDiameter - smallDiameter - 2}px`;
		$('.legend-small').style.left = `${smallDiameter / 2}px`;

		// label the max and half values
		$('.legend-large-label').innerHTML = `${maxValue.toLocaleString()}`;
		$('.legend-small-label').innerHTML = (maxValue / 2).toLocaleString();

		// adjust the position of the large based on size of circle
		$('.legend-large-label').style.top = `${-11}px`;
		$('.legend-large-label').style.left = `${largeDiameter + 30}px`;

		// adjust the position of the large based on size of circle
		$('.legend-small-label').style.top = `${smallDiameter - 13}px`;
		$('.legend-small-label').style.left = `${largeDiameter + 30}px`;

		// insert a couple hr elements and use to connect value label to top of each circle
		$('hr.small').style.top = `${largeDiameter - smallDiameter - 10}px`;
	}

	//* ############################# Slider ####################################

	// ----------------------------- sequenceUI Function ------------------------
	//! call from within drawMap function
	function sequenceUI(girlsLayer, boysLayer) {
		// create Leaflet control for the slider
		const sliderControl = L.control({
			position: 'bottomleft',
		});

		sliderControl.onAdd = function () {
			const controls = L.DomUtil.get('slider');

			L.DomEvent.disableScrollPropagation(controls);
			L.DomEvent.disableClickPropagation(controls);

			return controls;
		};

		sliderControl.addTo(map); // slider wont appear without this

		//select the slider's input and listen for change
		const slider = document.querySelector('#slider input');
		//select the slider's input and listen for change
		slider.addEventListener('input', function (e) {
			// current value of slider is current grade level
			var currentGrade = e.target.value;

			// resize the circles with updated grade level
			resizeCircles(girlsLayer, boysLayer, currentGrade);

			const sliderLegend = document.querySelector('.slider-legend span');
			sliderLegend.innerHTML = `Grade ${currentGrade}`;

			// update the output
			output.innerHTML = currentGrade;
		});
	} // end of sequenceUI function _____________________________________________

	//* ######################### Hover Window Info Panels ######################

	// ------------------------- retrieveInfo() Function ------------------------
	//! call from the end of the reSizeCircles() Function (so the information is retrieved before the user begins sliding the UI slider widget)
	function retrieveInfo(boysLayer, currentGrade) {
		// select the element and reference with variable
		const info = document.querySelector('#info');

		// since boysLayer is on top, use to detect mouseover events
		boysLayer.on('mouseover', function (e) {
			// replace the the display property with block and show
			info.style.display = 'block';

			// access properties of target layer
			const props = e.layer.feature.properties;

			// create a function with a short name to select elements
			const $ = function (x) {
				return document.querySelector(x);
			};

			// populate HTML elements with relevant info
			$('#info span').innerHTML = props.COUNTY;
			$('.girls span:first-child').innerHTML = `(grade ${currentGrade})`;
			$('.boys span:first-child').innerHTML = `(grade ${currentGrade})`;
			$('.girls span:last-child').innerHTML = Number(props[`G${currentGrade}`]).toLocaleString();
			$('.boys span:last-child').innerHTML = Number(props[`B${currentGrade}`]).toLocaleString();

			// raise opacity level as visual affordance
			e.layer.setStyle({
				fillOpacity: 0.6,
			});

			// empty arrays for boys and girls values
			const girlsValues = [],
				boysValues = [];

			// loop through the grade levels and push values into those arrays
			for (let i = 1; i <= 8; i++) {
				girlsValues.push(props['G' + i]);
				boysValues.push(props['B' + i]);
			}

			const girlsOptions = {
				id: 'girlspark',
				width: 280, // No need for units; D3 will use pixels.
				height: 50,
				color: getColor('girls'),
				lineWidth: 3,
			};

			const boysOptions = {
				id: 'boyspark',
				width: 280,
				height: 50,
				color: getColor('boys'),
				lineWidth: 3,
			};

			sparkLine(girlsValues, girlsOptions, currentGrade);
			sparkLine(boysValues, boysOptions, currentGrade);
		});

		boysLayer.on('mouseout', function (e) {
			info.style.display = 'none';

			e.layer.setStyle({
				fillOpacity: 0,
			});
		});

		// Method: info window move with mouse ************************************
		// when the mouse moves on the document
		document.addEventListener('mousemove', function (e) {
			// If the page is on the small screen, calculate the position of the info window
			if (window.innerWidth < 768) {
				info.style.right = '10px';
				info.style.top = `${window.innerHeight * 0.25 + 5}px`;
			} else {
				// Console the page coordinates to understand positioning
				console.log(e.pageX, e.pageY);

				// offset info window position from the mouse position
				(info.style.left = `${e.pageX + 6}px`), (info.style.top = `${e.pageY - info.offsetHeight - 25}px`);

				// if it crashes into the right, flip it to the left
				if (e.pageX + info.offsetWidth > window.innerWidth) {
					info.style.left = `${e.pageX - info.offsetWidth - 6}px`;
				}
				// if it crashes into the top, flip it lower right
				if (e.pageY - info.offsetHeight - 25 < 0) {
					info.style.top = `${e.pageY + 6}px`;
				}
			}
		});
	} // end retrieveInfo function ______________________________________________

	// -------------------------- sparkLine Function ----------------------------
	//! call from within the retrieveInfo function before the mouseout method is called
	function sparkLine(data, options, currentGrade) {
		d3.select(`#${options.id} svg`).remove();

		const w = options.width,
			h = options.height,
			m = {
				top: 5,
				right: 5,
				bottom: 5,
				left: 5,
			},
			iw = w - m.left - m.right,
			ih = h - m.top - m.bottom,
			x = d3.scaleLinear().domain([0, data.length]).range([0, iw]),
			y = d3
				.scaleLinear()
				.domain([d3.min(data), d3.max(data)])
				.range([ih, 0]);

		const svg = d3.select(`#${options.id}`).append('svg').attr('width', w).attr('height', h).append('g').attr('transform', `translate(${m.left},${m.top})`);

		const line = d3
			.line()
			.x((d, i) => x(i))
			.y((d) => y(d));

		const area = d3
			.area()
			.x((d, i) => x(i))
			.y0(d3.min(data))
			.y1((d) => y(d));

		svg.append('path').datum(data).attr('stroke-width', 0).attr('fill', options.color).attr('opacity', 0.5).attr('d', area);

		svg.append('path').datum(data).attr('fill', 'none').attr('stroke', options.color).attr('stroke-width', options.lineWidth).attr('d', line);

		svg.append('circle')
			.attr('cx', x(Number(currentGrade) - 1))
			.attr('cy', y(data[Number(currentGrade) - 1]))
			.attr('r', '4px')
			.attr('fill', 'white')
			.attr('stroke', options.color)
			.attr('stroke-width', options.lineWidth / 2);
	}
})();
