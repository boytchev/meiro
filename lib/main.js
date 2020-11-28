//	MEIRO
//	General functions
//
//	Options:
//	 └─ options{}
//	
//	Interval arithmetic:
//	 ├─ random(min,max)
//	 │   ├─ randomize()   
//	 │   └─ random.seed
//	 ├─ equal(a, b)
//	 ├─ delta(min,max)
//	 │   └─ deltaAbs(min,max)
//	 ├─ distSqr(from,to)
//	 ├─ middle(min,max)
//	 └─ inInterval(pos,min,max)
//	     ├─ inArea(pos,min,max)
//	     └─ areaInArea(min,max,min,max)
//
//	THREE.WebGLRenderer - modified prototype
//	 └─ fullWindow()
//
//	MEIRO.CornerButton(corner,onclick,text,icon) - creation of a button
//	 ├─ show()
//	 ├─ hide()
//	 ├─ setIcon(icon)
//	 ├─ setText(text)
//	 └─ setTextIcon(text,icon)
//
//	MEIRO.AnimationLoop(loop)
//	 ├─ TIMEOUT = 2000
//	 ├─ update()
//	 ├─ activate()
//	 └─ reanimate() -- standalone function
//
//	MEIRO.Statistics()
//	 ├─ show()
//	 ├─ hide()
//	 └─ update()
//
//	MEIRO.Model(room)
//	 ├─ onEnter()
//	 ├─ onExit()
//	 ├─ onInfo(element)
//	 └─ bindRoom(room)
//
//	MEIRO
//	 ├─ demoMode()
//	 └─ loadTexture(path,repeatU,repeatV)
//
//	2017.08 - P. Boytchev

if (window.self == window.top)
{
	console.log('\n\n(\\/)\n( ..)\t\tU speaks JS\nc(”)(”)\t\tI can haz halp\n\n ');
}


if (typeof MEIRO == 'undefined') MEIRO = {};

MEIRO.VERSION = '0.22',
MEIRO.BACKGROUND_UI = 'whitesmoke'; // sort of light grey
MEIRO.BACKGROUND_COLOR = 'black'; // sort of light grey
MEIRO.WIDENESS = 0.2; // width of walls
MEIRO.THICKNESS = 0.2; // thickness of floor
MEIRO.RESOLUTION = 1; // 1=native, 2=twice smaller, n=n times smaller
MEIRO.STANDALONE_MODELS = true; // true=each model is a scene rendered after screen AO; false=model inside global scene
MEIRO.SESSION_KEY = {
	ROOM_OCCUPANCY: 'room-occupancy',
	
}
MEIRO.SHADER ={};

MEIRO.RAILING = {
	HEIGHT: 0.3,
	WIDTH: 0.05,
}

MEIRO.DEFAULT = MEIRO.DEFAULT || {};


buttonBlueprint = null;


/*
Компетенции:
MATH:
	1.1. Прилагане на математически обекти
	1.2. Създаване и използване на уравнения
	1.3. Изчисляване на параметри и свойства
	1.4. Откриване на математически зависимости
	1.5. Апроксимиране на сложни зависимости
COMPUTER SCIENCE:
	2.1. Алгоритми за растеризация и обработка на векторни данни
	2.2. Представяне, обработване и използване на геометрични данни
	2.3. Представяне и обработване на движение
	2.4. Представяне и обработване на типове графични обекти
PHYSICS:
	3.1. Физични закони и влиянието им върху моделирането на движение
	3.2. Симулиране на физични явления
	3.3. Математическо и алгоритмично представяне на явления
ART:
	4.1. Работа с цветове и палитри
	4.2. Операции с геометрични форми
	4.3. Пространствено ориентиране в 2D и 3D
	4.4. Темпорално ориентиране и синхронизиране на събития
	4.5. Създаване, прилагане и съчетаване на графични ефекти

Нива на умения: https://hr.nih.gov/working-nih/competencies/competencies-proficiency-scale
	0.	Not Applicable
	1.	Fundamental Awareness (basic knowledge)
	2.	Novice (limited experience)
	3.	Intermediate (practical application)
	4.	Advanced (applied theory)
	5.	Expert (recognized authority)
*/

//----------------------------------------------------------
// Collect options extracted from document's URL.
//		id		player id (eg. faculty number) - used as random.seed
//		pos		player position 'XxYxZ', Y is level, no default
//		size	dungeon size 'XxYxZ', default '20x3x15'
//		rooms	desired number of stairs in all levels, default 10
//		floors	desired number of floors (overrides size.y)
//		stairs	approximate number of stairs between two levels, default 5
//		back	encoded return address
//		lowpoly
//		notextures
//		debugtextures
//		noao
//		sao
//		modeloverlay
//		zoom	zoom factor (from 1/zoom to zoom)
//----------------------------------------------------------
MEIRO.parseOptions = function(intoObject)
{
	var match,
		pl = /\+/g, // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) {
			return decodeURIComponent(s.replace(pl, " "));
		},
		query = window.location.search.substring(1);
	while (match = search.exec(query))
		intoObject[decode(match[1])] = decode(match[2]);
		
	return query;
}


MEIRO.Options = function()
{
	function paramInt(param,min,def,max)
	{
		var value = parseInt(param)||def;
		if (param=='0') value=0;
		return Math.max(Math.min(value,max),min);
	}
	function paramFloat(param,min,def,max)
	{
		var value = parseFloat(param)||def;
		if (param=='0') value=0;
		return Math.max(Math.min(value,max),min);
	}
	function paramFloatUnclamped(param,def)
	{
		var value = parseFloat(param)||def;
		if (param=='0') value=0;
		return value;
	}
	
	this.urlOptions = MEIRO.DEFAULT||{};
	this.urlString = MEIRO.parseOptions(this.urlOptions);
	
	// process size - dungeon size
	var s = (this.urlOptions.size||'').split('x');
	this.size = {
		x: paramInt(s[0],4,15,100),
		y: paramInt(s[1],1,3,30),
		z: paramInt(s[2],4,20,100)
	}
	
	// difficulty
	this.difficulty = paramInt(this.urlOptions.difficulty,0,0,10);

	// process stairs - desired number of stairs between two levels
	this.stairs = paramInt(this.urlOptions.stairs,0,5,200);

	// process rooms - desired number of rooms in all levels
	this.rooms = paramInt(this.urlOptions.rooms,1,10,100000);

	// process floors - desired number of floors (overrides size.y)
	this.size.y = paramInt(this.urlOptions.floors,1,this.size.y,30);

	// process pos - player's position
	if (this.urlOptions.pos)
	{
		var s = (this.urlOptions.pos||'').split('x');
		this.player = {
			x: paramFloat(s[0],0,0,this.size.x),
			y: paramFloat(s[1],0,0,2*this.size.y),
			z: paramFloat(s[2],0,0,this.size.z),
			rot: paramFloatUnclamped(s[3],0)
		};
	}

	// process split - room splitting
	var s = (this.urlOptions.split||'').split('x');
	this.split = {
		minRoom: paramInt(s[0],1,3,30),
		maxRoom: paramInt(s[1],1,8,100),
		extraDoors: paramFloat(s[2],0,0.1,1),
	}
	
	// process zoom factor
	this.zoom = paramFloat(this.urlOptions.zoom,1,1,10);

	// process id, if 0 pick a random id
	if (this.urlOptions.id=='anon')
		this.id = 0
	else
		this.id = parseFloat(this.urlOptions.id)||random(0,100000);
	
	// textures
	switch (this.urlOptions.texture)
	{
		case 'no':
		case 'none':
		case 'false':
			this.noTextures = true;
			this.textures = false;
			this.debugTextures = false;
			break;
		case 'debug':
		case 'grid':
			this.noTextures = false;
			this.textures = true;
			this.debugTextures = true;
			break;
		case 'yes':
		case 'true':
		case 'default':
		default:
			this.noTextures = false;
			this.textures = true;
			this.debugTextures = false;
			break;
	}
	
	// ambient occlusion
	switch (this.urlOptions.ao)
	{
		case 'no':
		case 'none':
		case 'false':
			this.noAO = true;
			this.FSSAO = false;
			this.SAO = false;
			this.SSAO = false;
			this.NNAO = false;
			break;
		case 'sao':
			this.noAO = false;
			this.FSSAO = false;
			this.SAO = true;
			this.SSAO = false;
			this.NNAO = false;
			break;
		case 'ssao':
			this.noAO = false;
			this.FSSAO = false;
			this.SAO = false;
			this.SSAO = true;
			this.NNAO = false;
			break;
		case 'nnao':
			this.noAO = false;
			this.FSSAO = false;
			this.SAO = false;
			this.SSAO = false;
			this.NNAO = true;
			break;
		case 'yes':
		case 'true':
		case 'default':
		case 'fssao':
		default:
			this.noAO = false;
			this.FSSAO = true;
			this.SAO = false;
			this.SSAO = false;
			this.NNAO = false;
			break;
	}

	// auto positioning
	if ('autopos' in this.urlOptions)
		this.autoPos = this.urlOptions.autopos=='true';
	else
		this.autoPos = true;

	this.modelOverlay = ['yes','true'].indexOf(this.urlOptions.modeloverlay)>-1;
	//console.log(this.modelOverlay,this.urlOptions.modeloverlay);

	// polygon count
	this.lowpoly = ('lowpoly' in this.urlOptions);
	this.highpoly = !this.lowpoly;
	
	// process back URL (if any)
	this.backURL = this.urlOptions.back?decodeURIComponent(this.urlOptions.back):'';

	// models
	this.models = this.urlOptions.model || this.urlOptions.models || '';
	
	console.dir(this,{depth:null});
};


// generate vital URL parameters
MEIRO.Options.prototype.vitals = function()
{
	// if the navigation was first-person, use its position for player
	if (controls instanceof MEIRO.FirstPersonControls)
	{
		options.player = {};
		options.player.x = camera.position.x.toFixed(2);
		options.player.y = (camera.position.y-MEIRO.VIEW_HEIGHT).toFixed(2);
		options.player.z = camera.position.z.toFixed(2);
		
		var angle = controls.rot.x % (2*Math.PI);
		if (angle<0) angle += 2*Math.PI;
		options.player.rot = angle.toFixed(2);
	}
	
	var vitals = 'id='+this.id;
	vitals += '&size='+this.size.x+'x'+this.size.y+'x'+this.size.z;
	vitals += '&stairs='+this.stairs;
	if (this.player)
		vitals += '&pos='+this.player.x+'x'+this.player.y+'x'+this.player.z+'x'+this.player.rot;
	vitals += '&split='+this.split.minRoom+'x'+this.split.maxRoom+'x'+this.split.extraDoors;
	
	if (this.noTextures)
		vitals += '&texture=false';
	else if (this.debugTextures)
		vitals += '&texture=grid';
	else
		vitals += '&texture=true';

	if (this.noAO)
		vitals += '&ao=false';
	else if (this.SAO)
		vitals += '&ao=sao';
	else if (this.SSAO)
		vitals += '&ao=ssao';
	else if (this.NNAO)
		vitals += '&ao=nnao';
	else 
		vitals += '&ao=fssao';
		
	if (this.lowpoly)
		vitals += '&lowpoly';
		
	vitals += '&autopos=false';
		
	if (this.modelOverlay)
		vitals += '&modeloverlay=yes';
	else
		vitals += '&modeloverlay=no';
		
	if (this.models)
		vitals += '&models='+this.models;
		
	if (this.rooms)
		vitals += '&rooms='+this.rooms;

	return vitals;
}


//----------------------------------------------------------
// Seedable integer random generator. Returns integer number
// from MIN to MAX, inclusive. The algorithm is adapted from
// indiegamr.com/generate-repeatable-random-numbers-in-js/
//
//		n = random(min,max);
//		random.seed = n;
//
// If MIN>MAX return MIN.
//----------------------------------------------------------
function random(min, max)
{
	if (min>max) return min;
	
	random.seed = (random.seed * 9301 + 49297) % 233280;
	var rnd = random.seed / 233280;
	
	return Math.round(min - 0.5 + rnd * (max - min + 1));
}

random.randomize = function()
{
	random.seed = (new Date()).getMilliseconds(); // Initial random seed
}

random.randomize();

function random2(min, max)
{
	var a = random(min, max);
	var b = random(min, max);
	
	return Math.round((a+b)/2);
}



//----------------------------------------------------------
// Check whether two numbers are equal or almost equal
//
//		tf = equal(a,b);
//----------------------------------------------------------
var EPS = 0.01;
function equal(a, b) {
	return Math.abs(a-b)<EPS;
}


function delta(min,max)
{
	return {x:max.x-min.x, z:max.z-min.z};
}


function area(min,max)
{
	return (max.x-min.x)*(max.z-min.z);
}


function deltaAbs(min,max)
{
	return {x:Math.abs(max.x-min.x), z:Math.abs(max.z-min.z)};
}


function distSqr(from,to)
{
	return (from.x-to.x)*(from.x-to.x)+(from.z-to.z)*(from.z-to.z);
}


function middle(min,max)
{
	return {x:(max.x+min.x)/2, z:(max.z+min.z)/2};
}


function inInterval(pos,min,max)
{
	return (min-EPS<pos && pos<max+EPS);
}


function inArea(pos,min,max)
{
	return inInterval(pos.x,min.x,max.x) && inInterval(pos.z,min.z,max.z);
}


function inAreaZone(pos,min,max,zone)
{
	return inInterval(pos.x,min.x-zone,max.x+zone) && inInterval(pos.z,min.z-zone,max.z+zone);
}


function areaInArea(posMin,posMax,min,max)
{
	return inArea(posMin,min,max) && inArea(posMax,min,max);
}

function minCrossAreas(min1,max1,min2,max2)
{
	return {x:Math.max(min1.x,min2.x),z:Math.max(min1.z,min2.z)};
}

function maxCrossAreas(min1,max1,min2,max2)
{
	return {x:Math.min(max1.x,max2.x),z:Math.min(max1.z,max2.z)};
}

function areaCrossArea(min1,max1,zone1,min2,max2)
{
	var min = {x:Math.max(min1.x-zone1,min2.x),z:Math.max(min1.z-zone1,min2.z)};
	var max = {x:Math.min(max1.x+zone1,max2.x),z:Math.min(max1.z+zone1,max2.z)};
	var size = delta(min,max);
	
	return (size.x>-EPS && size.z>-EPS);
}

// calculate level from Y coordinate of the player
function levelFromPos(y)
{
	//	(0)--(Eps)--------(1-Eps)--(1)
	//
	
	var level = y/MEIRO.STAIRS.HEIGHT;
	if ((level%1)>1-EPS)
	{	// upper level
		return Math.ceil(level);
	}
	else
	{	// lower level
		return Math.floor(level);
	}
}


//----------------------------------------------------------
// Initializes the Three.js renderer. Sets the canvas to
// fullwindow (not fullscreen!) mode. Sets renderer,
// perspective camera, scene.
//----------------------------------------------------------
THREE.WebGLRenderer.prototype.fullWindow = function () {
	this.setClearColor(MEIRO.BACKGROUND_COLOR);
	this.setSize(window.innerWidth/MEIRO.RESOLUTION, window.innerHeight/MEIRO.RESOLUTION);
	this.setPixelRatio( window.devicePixelRatio );
	this.domElement.style = 'width:100%; height:100%; position:fixed; top:0; left:0; z-index:-1;';
	document.body.appendChild(this.domElement);

	// the automatic resizer
	window.addEventListener('resize', onWindowResize, false);
}

// Handler of window resize events (e.g. a mobile device is
// flipped from portrait to landscape or vice versa)
function onWindowResize() {
	renderer.setSize(window.innerWidth/MEIRO.RESOLUTION, window.innerHeight/MEIRO.RESOLUTION);
	renderer.domElement.style = 'width:100%; height:100%; position:fixed; top:0; left:0; z-index:-1;';
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.fov = 80/camera.aspect;
	camera.updateProjectionMatrix();

	if (ao.ScreenAO)
	{
		ao.ScreenAO.onWindowResize();
	}
	reanimate();
}

//----------------------------------------------------------
// Corner buttons - located at window corner, have an icon
// and a diagonal text. Equivalent to HTML code:
//		<div class="cornerButton" corner="..." onclick="...">
//			<div class="cornerIcon"></div>
//			<div class="cornerText">...</div>
//		</div>
//----------------------------------------------------------
MEIRO.CornerButton = function (corner, onclick, text, icon) {
	// create the button; triangular shape
	this.button = document.createElement('div');
	this.button.className = 'cornerButton';
	this.button.setAttribute('corner', corner);
	this.button.onclick = onclick;

	// create the icon
	this.icon = document.createElement('img');
	this.icon.className = 'cornerIcon';
	this.icon.src = icon;

	// create the sloped text
	this.text = document.createElement('div');
	this.text.className = 'cornerText';
	this.text.style.backgroundColor = MEIRO.BACKGROUND_UI;
	this.text.innerHTML = text;

	// add button subelements to the button
	this.button.appendChild(this.icon);
	this.button.appendChild(this.text);

	// add the button to DOM
	document.body.appendChild(this.button);
}

// Method for showing a corner button
MEIRO.CornerButton.prototype.show = function () {
	this.button.style.display = 'block';
}

// Method for hiding a corner button
MEIRO.CornerButton.prototype.hide = function () {
	this.button.style.display = 'none';
}

// Method for changing the corner button's icon
MEIRO.CornerButton.prototype.setIcon = function (icon) {
	this.icon.src = icon;
}

// Method for changing the corner button's text
MEIRO.CornerButton.prototype.setText = function (text) {
	this.text.innerHTML = text;
}

// Method for changing the corner button's text and icon
MEIRO.CornerButton.prototype.setTextIcon = function (text,icon) {
	this.setIcon(icon);
	this.setText(text);
}


//----------------------------------------------------------
// The animaiton looper reduces power comsumption by skipping
// some of the rendering loops. Namely, after some time of
// inactivity the rendering loop is stopped. It is resumed
// if a new activity happens. Activity means firing any
// mouse, touch or key event.
//----------------------------------------------------------

MEIRO.AnimationLoop = function (loop,stats) {
	this.loop = loop;
	this.time = 0;
	this.request = 0;
	this.activate();
	if (stats) this.stats = new MEIRO.Statistics();
}

// 2 seconds timeout before canceling rendering loop
MEIRO.AnimationLoop.TIMEOUT = 2000; // in ms (1s = 1000ms)
//MEIRO.AnimationLoop.TIMEOUT = 10; // in ms (1s = 1000ms)

MEIRO.AnimationLoop.prototype.update = function () {
	this.request = 0;
	var time = (performance || Date).now();
	if (time - this.time <= MEIRO.AnimationLoop.TIMEOUT) { // requesting another frame if the last
		// user activity was less than some ago
		this.request = requestAnimationFrame(this.loop);
		if (controls.room && controls.room.onAnimate)
			controls.room.onAnimate(time);
	} else { // otherwise do not request another frame
		if (this.stats) this.stats.hide();
	}
	if (this.stats) this.stats.update();
}

MEIRO.AnimationLoop.prototype.activate = function () {
	this.time = (performance || Date).now();
	if (!this.request) {
		this.request = requestAnimationFrame(this.loop);
	}
}

//----------------------------------------------------------
// Optional functionality. Adds statistics bar at the top of
// the window.
//----------------------------------------------------------
MEIRO.Statistics = function () {
	this.element = document.createElement('div');
	this.element.className = 'statistics';
	this.element.style.backgroundColor = MEIRO.BACKGROUND_UI;
	document.body.appendChild(this.element);

	this.time = (performance || Date).now();
	this.frames = 0;
	this.visible = true;
	this.fps = 0;
}

MEIRO.Statistics.prototype.update = function () {
	this.frames++;
	var time = (performance || Date).now();
	var dTime = time - this.time;
	if (dTime >= 500) {
		this.show();
		this.fps = (this.frames / dTime * 1000);
		var txt = 'FPS ' + this.fps.toFixed(0);
		if (performance && performance.memory)
			txt += ' &middot; ' + (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(0) + ' MB';
		this.element.innerHTML = txt;
		this.frames = 0;
		this.time = time;
	}
}

MEIRO.Statistics.prototype.show = function () {
	if (this.visible)
		return;
	this.element.style.display = 'block';
	this.visible = true;
}

MEIRO.Statistics.prototype.hide = function () {
	if (!this.visible)
		return;
	this.element.style.display = 'none';
	this.visible = !true;
}


// general Model class
MEIRO.Model = function(room,model)
{
	this.image = new THREE.Scene();

	if (model)
	{	// get class name
		// http://stackoverflow.com/questions/332422/how-do-i-get-the-name-of-an-objects-type-in-javascript
		var funcNameRegex = /function\s([^(]{1,})\(/;
		var results = (funcNameRegex).exec(model.toString());
		this.modelName = (results && results.length > 1) ? results[1].trim() : "";
	}
	
	this.MIN_DIST = MEIRO.Models[this.modelName].DIST.MIN;
	this.MAX_DIST = MEIRO.Models[this.modelName].DIST.MAX;
	this.HEIGHT = MEIRO.Models[this.modelName].DIST.HEIGHT;
	this.SHIFT_X = MEIRO.Models[this.modelName].DIST.SHIFT_X||0;
	this.SHIFT_Z = MEIRO.Models[this.modelName].DIST.SHIFT_Z||0;
	this.MIN_ROT_Y = MEIRO.Models[this.modelName].ROT_Y.MIN;
	this.MAX_ROT_Y = MEIRO.Models[this.modelName].ROT_Y.MAX;
	this.POS_DIST = MEIRO.Models[this.modelName].POS.DIST;
	this.POS_ROT_X = MEIRO.Models[this.modelName].POS.ROT_X;
	this.POS_ROT_Y = MEIRO.Models[this.modelName].POS.ROT_Y;
	this.ON_FLOOR = MEIRO.Models[this.modelName].POS.ON_FLOOR||false;
	if (MEIRO.Models[this.modelName].SCALE)
		this.MAX_SCALE = MEIRO.Models[this.modelName].SCALE.MAX||0.5;
	else
		this.MAX_SCALE = 0.5;

	if (room) this.bindRoom(room);
	//this.image.visible = false;
}


// onEnter event handle - entering the room shows the model
MEIRO.Model.prototype.onEnter = function()
{
	console.log('Enter model',this.modelName);
	//this.image.visible = true;
	
	// show all buttons
	for (var r in this)
		if (this[r] instanceof MEIRO.CornerButton)
		{
			this[r].show();
		}
}


// onExit event handle - exiting the room hides the model
MEIRO.Model.prototype.onExit = function()
{
	console.log('Exit model',this.modelName);
	//this.image.visible = false;
	
	// hide all buttons
	for (var r in this)
		if (this[r] instanceof MEIRO.CornerButton)
			this[r].hide();
}


MEIRO.Model.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Инфо</h1>';
	s += '<p>Намираш се на етаж №'+this.room.level.levelIndex+', стая №'+this.room.index+'</p>';
	s += '<p>Кликни тук, за да се върнеш обратно.</p>';
	
	element.innerHTML = s;
}


MEIRO.Model.prototype.bindRoom = function(room)
{
	room.model = this;
	this.room = room;
	
	// set event handlers on room entry/exit and on model animation
	//room.onEnter = function(){this.model.onEnter();}
	//room.onExit = function(){this.model.onExit()}
	room.onInfo = function(element){this.model.onInfo(element);}
	room.onAnimate = function(time){
		this.model.animateDefaultLight();
		this.model.onAnimate(time);
	}

	// place the model in the center of the room
	this.mid = middle(room.min,room.max);
	size = delta(room.min,room.max);
	size = Math.min(size.x,size.z);
	//this.scale = Math.min(1/10 * (size-MEIRO.WIDENESS-EPS)/(2*this.MAX_DIST), 1/10);
	this.scale = Math.min(this.MAX_SCALE, (size-MEIRO.WIDENESS-EPS)/(2*this.MAX_DIST));
	//console.log('room scale ',this.scale);
	
	//var mesh = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.ISOSPHERE, MEIRO.PRIMITIVE.STYLE.WIREFRAME_GRID);
	//mesh.scale.set(this.MAX_DIST,this.MAX_DIST,this.MAX_DIST);
	//this.image.add(mesh);
	//var mesh = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.ISOSPHERE, MEIRO.PRIMITIVE.STYLE.WIREFRAME_GRID);
	//mesh.scale.set(this.MIN_DIST,this.MIN_DIST,this.MIN_DIST);
	//this.image.add(mesh);
	
	// model position
	var mx = this.mid.x+this.SHIFT_X*this.scale;
	var my = room.level.levelIndex*MEIRO.STAIRS.HEIGHT+this.HEIGHT*this.scale+MEIRO.VIEW_HEIGHT;
	var mz = this.mid.z+this.SHIFT_Z*this.scale;

	if (this.ON_FLOOR) my -= MEIRO.VIEW_HEIGHT-MEIRO.THICKNESS/2;
	
	this.image.position.set(mx,my,mz);
	this.image.scale.set(this.scale,this.scale,this.scale);
	this.addDefaultLight();
}


MEIRO.Model.prototype.addDefaultLight = function()
{
	// add default light
	this.defaultTarget = new THREE.Object3D();
	this.defaultLight = new THREE.DirectionalLight('white',3/3);
	this.defaultLight.position.set(1,0,0);
	this.defaultLight.target = this.target;
	this.image.add(this.defaultTarget, this.defaultLight);
}


MEIRO.Model.prototype.animateDefaultLight = function()
{
	if (controls.freeWalk)
		this.defaultLight.position.set(-Math.cos(controls.rot.x),-Math.sin(controls.rot.y),-Math.sin(controls.rot.x));
	else
		this.defaultLight.position.set(Math.cos(controls.rot.x),Math.sin(controls.rot.y),Math.sin(controls.rot.x));
	this.defaultLight.target = this.defaultTarget;
}

MEIRO.Models = {};

// suggest estimated dungeon size with given number of floors, stairs and empty rooms
MEIRO.estimateSize = function(rooms,floors,stairs,size)
{
	// if:
	//		dungeon size=(X,Y,Z)  (Y-number of levels, assuming level height is 1)
	//		size = room size
	// then:
	// 		rooms = Y*Ceil(X/size)*Ceil(Z/size)-2*(Y-1)*stairs

	// remove rooms ocupied by stairs
	rooms = rooms + 2*(floors-1)*stairs;
	// now we have: Y*Ceil(X/size)*Ceil(Z/size) = rooms+2*(Y-1)*stairs
	
	// adjust for the number of floors
	rooms = rooms / floors;
	// now we have: Ceil(X/size)*Ceil(Z/size) = (rooms+2*(Y-1)*stairs)/Y
	
	// assume ratio X/Z=golden=1.618 (approx)
	// if Ceil(X/size)=cx and Ceil(Z/size)=cz
	// we have cx*cz = 1.618*cz*cz
	var k = 1.518+0.2*Math.random();
	var cz = Math.sqrt(rooms/1.618); 
	var z = Math.floor(cz*size);
	var x = Math.floor(cz*size*1.618);
	
	//console.log('calc size=',x+'x'+floors+'x'+z);
	//console.log('requested rooms',rooms);
	//console.log('provided rooms',floors*Math.ceil(x/size)*Math.ceil(z/size)-2*(floors-1)*stairs);
	return x+'x'+floors+'x'+z;
}


MEIRO.getListOfModels = function(onCompleted)
{
	var options = {};
	MEIRO.parseOptions(options);
	var models = (options.models||options.model||'').split(',');
	for (var m in models)
		if (models[m])
			addScript('lib/models/'+models[m]+'.js');
			
	var waitTime = 50;
	var maxAttempts = 3000/waitTime;
	var interval = setInterval(function(){
		//console.log('Pending scripts',addScript.pendingScripts);
		maxAttempts--;
		if (!addScript.pendingScripts || maxAttempts<0)
		{
			if (maxAttempts<0) console.error('Not all model scripts loaded. Pending scripts',addScript.pendingScripts);
			clearInterval(interval);
			onCompleted();
		}
	},waitTime);
}


MEIRO.demoMode = function()
{
	MEIRO.getListOfModels(MEIRO._demoMode);
}

MEIRO._demoMode = function()
{
	var modelsNames = Object.keys(MEIRO.Models);
	
	if (modelsNames.length<2)
	{
		MEIRO.singleRoom = true;
		MEIRO.DEFAULT = {
				size: '6x1x6',
				stairs: '0',
				split: '6x6x0',
				texture: 'false',
				ao: 'no',
				modeloverlay: 'yes',
				pos: '1x0x1x0.2'
		};
		MEIRO.BACKGROUND_COLOR = 'white';
	}
	else
		MEIRO.DEFAULT = {
				size: MEIRO.estimateSize(modelsNames.length,Math.round(modelsNames.length/10),0,6),
				stairs: '5',
				split: '2x6x0.2',
				texture: 'true',
				ao: 'fssao',
				modeloverlay: 'yes',
				pos: '1x0x1x0.2'
		};
	
	//console.log('default size',MEIRO.DEFAULT.size);

	options = new MEIRO.Options();
	MEIRO.initDungeonRoom();
	MEIRO.initPrimitives();
	
	// initialize the rendering canvas
	renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
	renderer.fullWindow();

	//globalClippingPlane = new THREE.Plane( new THREE.Vector3(0,-1,0), 10*MEIRO.STAIRS.HEIGHT );
	//renderer.clippingPlanes = [ globalClippingPlane ];
	
	// setup scene and perspective camera
	scene = new THREE.Scene();
	scene.fog=new THREE.FogExp2( 'black', options.noAO?0.10:0.07 );
	
	var aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera(80/aspect, aspect, 0.02, 20);

	// managing the animation loop (& save battery & show statistics)
	animationLoop = new MEIRO.AnimationLoop(MEIRO.defaultLoop,true); 

	// create the dungeon
	dungeon = new MEIRO.Dungeon( {x:options.maxX,y:options.maxY,z:options.maxZ},options.stairs );
	{
		console.time('Image');
		dungeon.image = new THREE.Object3D();
		if (modelsNames.length>1 || !options.noAO)
		{
			dungeon.imageFloor();
			dungeon.imageWalls();
			dungeon.imageStairs();
			scene.add(dungeon.image);
		}
		console.timeEnd('Image');
	}
	
	// button for help info
	var buttonInfo = new MEIRO.CornerButton('bottomRight', MEIRO.showInfo, 'ИНФО', 'images/help.info.min.png');
	
	// put the view point in the dungeon
	controls = new MEIRO.FirstPersonControls(dungeon,(modelsNames.length>1)/*button*/);
	if (controls.room.model)
		controls.startOrbitWalk();
	else
		controls.startFreeWalk();
		
	ao = new MEIRO.AO();
	
	// buttons for blueprint map if there is more than one room
	if (dungeon.levels[0].rooms.length>1)
	{
		buttonBlueprint = new MEIRO.CornerButton('topRight', function(){MEIRO.goBlueprint('model.html');}, 'КАРТА', 'images/blueprint.map.min.png');
		//buttonBlueprint.icon.style.fontFamily = 'Webdings';	
	}
	
	// allocates models in empty rooms
	var roomOccupancy = {};
	var rooms = dungeon.roomsBySize(true);
	for (var m=0; m<modelsNames.length; m++)
	{
		var modelName = modelsNames[m];
		var model = MEIRO.Models[modelName];
		var room = rooms[m].room;
		if (!roomOccupancy[rooms[m].levelNo]) roomOccupancy[rooms[m].levelNo]={};
		roomOccupancy[rooms[m].levelNo][rooms[m].roomNo]=modelName;
		new model(room,model);
	}
	
	// add models marks on the floors
	//dungeon.imageModelsMarks();

	//console.log(MEIRO.SESSION_KEY.ROOM_OCCUPANCY,JSON.stringify(roomOccupancy));
	sessionStorage.setItem(MEIRO.SESSION_KEY.ROOM_OCCUPANCY,JSON.stringify(roomOccupancy));
	
	controls.startWalk(controls.inTheRoom && controls.room.model && options.autoPos,options.autoPos);
}



MEIRO.goBlueprint = function(backURL)
{
	window.location.href = 'blueprint.html?'+options.vitals()+'&back='+encodeURIComponent(backURL||'play.html');
}


MEIRO.showInfo = function(element,onBeforeCloseInfo,onAfterCloseInfo)
{
	var element = document.getElementById('infoPanel');
	element.onBeforeCloseInfo = onBeforeCloseInfo||null;
	element.onAfterCloseInfo = onAfterCloseInfo||null;

	if (controls.room.onInfo) controls.room.onInfo(element);
	
	window.addEventListener( 'keydown', MEIRO.hideInfo, false );
	document.body.style.backgroundColor = 'DimGray';
	
	var elems = document.getElementsByTagName('canvas');
	for (var i=0; i<elems.length; i++)
	{
		elems[i].className += ' blured';
		elems[i].style.pointerEvents = 'none';
	}
	
	var elems = document.getElementsByClassName('cornerButton');
	for (var i=0; i<elems.length; i++)
	{
		elems[i].className += ' blured';
		elems[i].style.pointerEvents = 'none';
	}
	
					
	document.getElementById('infoPanel').style.display = 'block';
	document.getElementById('infoPanel').onAfterCloseInfo = onAfterCloseInfo;
	document.getElementById('infoPanel').onBeforeCloseInfo = onBeforeCloseInfo;
}


MEIRO.hideInfo = function()
{
	var infoPanel = document.getElementById('infoPanel');
	if (infoPanel.onBeforeCloseInfo) infoPanel.onBeforeCloseInfo();

	
	window.removeEventListener( 'keydown', MEIRO.hideInfo );
	document.body.style.backgroundColor = 'DimGray';
	
	var elems = document.getElementsByTagName('canvas');
	for (var i=0; i<elems.length; i++)
	{
		elems[i].classList.remove('blured');
		elems[i].style.pointerEvents = 'auto';
	}
	
	var elems = document.getElementsByClassName('cornerButton');
	for (var i=0; i<elems.length; i++)
	{
		elems[i].classList.remove('blured');
		elems[i].style.pointerEvents = 'auto';
	}
	
	infoPanel.style.display = 'none';
	infoPanel.style.display = 'none';
	
	if (infoPanel.onAfterCloseInfo) infoPanel.onAfterCloseInfo();
	infoPanel.onBeforeCloseInfo = null;
	infoPanel.onAfterCloseInfo = null;
}


MEIRO.defaultLoop = function()
{
	//TWEEN.update();
	controls.update();
	animationLoop.update();
	
	ao.render(scene, camera);
}

			
function reanimate() {
	animationLoop.activate();
}



function addScript( src )
{
	console.log('Loading',src);
	addScript.pendingScripts++;
	//console.log('Pending scripts',addScript.pendingScripts);
	var s = document.createElement( 'script' );
	s.setAttribute( 'src', src );
	s.onload = function(){
		addScript.pendingScripts--;
		//console.log('Pending scripts',addScript.pendingScripts);
	};
	document.head.appendChild( s );
}
addScript.pendingScripts = 0;


function rpm(time,rotPerMin)
{
	var unit = 2*Math.PI/60/1000; // one revolution per minute
	return unit*time*rotPerMin;
}



function postData(data,success,failure)
{
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function()
	{
		if (this.readyState == 4)
		{
			if (this.status==200 && this.responseText.toUpperCase().indexOf('ERROR')==-1)
			{
				if (success) success();
				console.log('postData: success',this.responseText);
			}
			else
			{
				if (failure) failure();
				console.log('postData: fail',this.responseText);
			}
		}
	};
	xmlhttp.open("POST", "recorder.php", true);
	xmlhttp.send(data);	
}


MEIRO.loadTexture = function (path, repeatU, repeatV)
{
	var texture = new THREE.TextureLoader().load( path );

	texture.magFilter = THREE.LinearFilter;
	texture.mimFilter = THREE.LinearMipMapLinearFilter;
	texture.anisotropy = 8;
	
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	
	if( repeatU && repeatV)
	{
		texture.repeat.set( repeatU, repeatV );
	}
	
	return texture;
}

MEIRO.allowLightmap = function(geometry)
{
	var uv = geometry.getAttribute('uv');
	
    geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uv.array, 2 ) );

	var uv2 = geometry.getAttribute('uv2');
	geometry.attributes.uv2 = geometry.attributes.uv;
}
